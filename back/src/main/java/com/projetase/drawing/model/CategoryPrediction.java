package com.projetase.drawing.model;

public class CategoryPrediction {
    private String category;
    private double confidence;

    public CategoryPrediction() {}

    public CategoryPrediction(String category, double confidence) {
        this.category = category;
        this.confidence = confidence;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    @Override
    public String toString() {
        return "CategoryPrediction{category=" + category + ", confidence=" + confidence + "}";
    }
}
