package com.projetase.drawing.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Point {
    private double x;
    private double y;
    private int pen;

    public Point() {}
    public Point(double x, double y, int pen) {
        this.x = x;
        this.y = y;
        this.pen = pen;
    }


    public double getX() { return x; }
    public void setX(double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }

    public int getPen() { return pen; }
    public void setPen(int pen) { this.pen = pen; }

    @Override
    public String toString() {
        return "(" + x + ", " + y + pen + ")";
    }
}