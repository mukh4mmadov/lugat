// Text of the 35th paper's printed material that is an image in the PDF (so
// the extractor finds no text layer), transcribed by hand. Used to explain
// answers; the exam itself shows the paper crop.
export const PAPER_35_TEXT_OVERRIDES = {
  40: {
    stemText: "“1년 사용한 컴퓨터를 팔아요.”\n가격: 100,000원\n연락처: study@Korea.co.kr\n(컴퓨터 그림)",
  },
  41: {
    stemText: "(휴대 전화 문자, 오후 12:25)\n민수 씨,\n제 동생이 왔어요.\n그래서 지금 회사 앞 커피숍에 있어요.\n1시에 회사에 가겠습니다. ^^\n지현 드림",
  },
  42: {
    stemText: "행복음악회\n음악회에 초대합니다.\n기간: 2014년 8월 1일 ~ 8월 31일\n일시: 매주 토요일 오후 8시\n장소: 하늘공원",
  },
  63: {
    sharedText:
      "(이메일)\n받는사람: sarang@parang.com; koreal@empan.com; minsu@bola.com; ok1213@maver.com; tree@maver.com\n제목: 유학생 농구 대회\n보낸사람: yumi@parang.com\n농구 대회에 참가 신청을 해 주셔서 감사합니다.\n이번 주 토요일 오전 10시에 운동장에서 대회가 시작됩니다.\n경기에 참가하는 선수들은 9시까지 와 주시기 바랍니다.\n비가 오면 학생회관 옆에 있는 체육관에서 경기를 하겠습니다.\n그럼, 토요일에 뵙겠습니다.\n학생회장 김유미 올림",
  },
};
// 63 and 64 share the e-mail.
PAPER_35_TEXT_OVERRIDES[64] = { sharedText: PAPER_35_TEXT_OVERRIDES[63].sharedText };
