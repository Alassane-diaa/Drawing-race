package com.projetase.drawing.model;

import java.util.List;

public class PredictionResponse {
    private CategoryPrediction prediction;
    private List<CategoryPrediction> top10;

    public PredictionResponse() {}

    public CategoryPrediction getPrediction() {
        return prediction;
    }

    public void setPrediction(CategoryPrediction prediction) {
        this.prediction = prediction;
    }

    public List<CategoryPrediction> getTop10() {
        return top10;
    }

    public void setTop10(List<CategoryPrediction> top10) {
        this.top10 = top10;
    }

    @Override
    public String toString() {
        return "PredictionResponse{prediction=" + prediction + ", top10=" + top10 + "}";
    }
}