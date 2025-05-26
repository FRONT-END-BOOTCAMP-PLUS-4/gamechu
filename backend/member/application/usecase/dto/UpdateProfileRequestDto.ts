export class UpdateProfileRequestDto {
  memberId: string;
  nickname: string;
  isMale: boolean;
  birthDate: string; // "yyyymmdd"
  imageUrl: string;  // ❌ null 또는 undefined 불가

  constructor(props: {
    memberId: string;
    nickname: string;
    isMale: boolean;
    birthDate: string;
    imageUrl: string; // ✅ 필수로 변경
  }) {
    this.memberId = props.memberId;
    this.nickname = props.nickname;
    this.isMale = props.isMale;
    this.birthDate = props.birthDate;
    this.imageUrl = props.imageUrl;
  }
}
