export class UpdateProfileRequestDto {
  memberId: string;
  nickname: string;
  isMale: boolean;
  birthDate: string; // "yyyymmdd"
  imageUrl?: string;

  constructor(props: {
    memberId: string;
    nickname: string;
    isMale: boolean;
    birthDate: string;
    imageUrl?: string;
  }) {
    this.memberId = props.memberId;
    this.nickname = props.nickname;
    this.isMale = props.isMale;
    this.birthDate = props.birthDate;
    this.imageUrl = props.imageUrl;
  }
}
