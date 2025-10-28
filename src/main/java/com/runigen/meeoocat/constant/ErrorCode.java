package com.runigen.meeoocat.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ErrorCode {
    //400 BAD_REQUEST 잘못된 요청
    INVALID_PARAMETER(400, "파라미터 값을 확인해주세요."),

    //500 INTERNAL SERVER ERROR
    INTERNAL_SERVER_ERROR(500, "서버 에러입니다. 서버 팀에 연락주세요!"),
    FOLDER_NOT_EMPTY(500, "빈 폴더가 아닙니다. 폴더 안에 문서 삭제 후 폴더를 삭제 하시기 바랍니다."),
    NOT_FOUND_FOLDER(500, "폴더를 찾을 수 없습니다."),
    NOT_FOUND_DOCUMENT(500, "존재하지 않는 문서 입니다. 문서번호를 확인해 주세요");

    private final int status;
    private final String message;
}
