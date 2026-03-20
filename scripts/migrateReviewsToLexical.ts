/**
 * DB 마이그레이션 스크립트: 리뷰 content HTML → Lexical JSON
 *
 * 실행 전 DB 백업 필수. 스테이징 환경에서 먼저 검증 후 프로덕션 실행.
 *
 * 실행:
 *   npx tsx scripts/migrateReviewsToLexical.ts
 */

import { createHeadlessEditor } from "@lexical/headless";
import { $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $insertNodes } from "lexical";
import { JSDOM } from "jsdom";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { PrismaClient } from "../prisma/generated";

const prisma = new PrismaClient();

const nodes = [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    AutoLinkNode,
    CodeNode,
    CodeHighlightNode,
];

async function migrate() {
    const reviews = await prisma.review.findMany({
        select: { id: true, content: true },
    });
    console.log(`마이그레이션 대상: ${reviews.length}건`);

    let skipped = 0;
    let converted = 0;
    let failed = 0;

    for (const review of reviews) {
        // 이미 Lexical JSON이면 건너뜀
        try {
            const parsed = JSON.parse(review.content);
            if (parsed?.root) {
                skipped++;
                continue;
            }
        } catch {
            // HTML — 변환 진행
        }

        const editor = createHeadlessEditor({
            nodes,
            onError: (e) => { throw e; },
        });

        try {
            const dom = new JSDOM(review.content);
            let lexicalJson = "";

            await new Promise<void>((resolve, reject) => {
                editor.update(
                    () => {
                        try {
                            const generatedNodes = $generateNodesFromDOM(
                                editor,
                                dom.window.document.body
                            );
                            $getRoot().clear();
                            $insertNodes(generatedNodes);
                        } catch (e) {
                            reject(e);
                        }
                    },
                    {
                        onUpdate: () => {
                            lexicalJson = JSON.stringify(
                                editor.getEditorState().toJSON()
                            );
                            resolve();
                        },
                    }
                );
            });

            await prisma.review.update({
                where: { id: review.id },
                data: { content: lexicalJson },
            });
            converted++;

            if (converted % 100 === 0) {
                console.log(`변환 완료: ${converted}건`);
            }
        } catch (err) {
            console.error(`리뷰 ${review.id} 변환 실패:`, err);
            failed++;
        }
    }

    console.log(`\n마이그레이션 완료`);
    console.log(`  건너뜀 (이미 JSON): ${skipped}건`);
    console.log(`  변환 완료: ${converted}건`);
    console.log(`  실패: ${failed}건`);
}

migrate()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
