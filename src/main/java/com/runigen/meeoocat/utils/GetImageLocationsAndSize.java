package com.runigen.meeoocat.utils;

import org.apache.pdfbox.contentstream.operator.DrawObject;
import org.apache.pdfbox.contentstream.PDFStreamEngine;

import java.io.IOException;

import org.apache.pdfbox.contentstream.operator.state.Concatenate;
import org.apache.pdfbox.contentstream.operator.state.Restore;
import org.apache.pdfbox.contentstream.operator.state.Save;
import org.apache.pdfbox.contentstream.operator.state.SetGraphicsStateParameters;
import org.apache.pdfbox.contentstream.operator.state.SetMatrix;

/**
 * 이미지 좌표를 구하기 위해 PDFStramEngine을 상속.
 */
public class GetImageLocationsAndSize extends PDFStreamEngine
{
    public GetImageLocationsAndSize() throws IOException
    {
        // preparing PDFStreamEngine
        addOperator(new Concatenate());
        addOperator(new DrawObject());
        addOperator(new SetGraphicsStateParameters());
        addOperator(new Save());
        addOperator(new Restore());
        addOperator(new SetMatrix());
    }

}