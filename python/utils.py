import torch


class Data:
    
    def __init__(self):
        self.raw_points = []  # Store all raw points from all strokes
        self.data = []  # Processed data with center and reduced deltas
        self.max_len = 100
    
    def process_data(self, data):
        max_len = 100
        mean_x = 2.73
        std_x = 27.59
        mean_y = 2.10
        std_y = 26.16
        
        # Add new stroke points to accumulated raw points
        points = data['points']
        for i in range(len(points)):
            self.raw_points.append({'x': points[i]['x'], 'y': points[i]['y']})
        
        # Step 1: Find min_x and min_y across all accumulated points
        if not self.raw_points:
            return
        
        min_x = min(p['x'] for p in self.raw_points)
        min_y = min(p['y'] for p in self.raw_points)
        
        # Step 2: Align to top-left corner (min = 0)
        aligned_points = []
        for p in self.raw_points:
            aligned_points.append({
                'x': p['x'] - min_x,
                'y': p['y'] - min_y
            })
        
        # Step 3: Find max value to scale uniformly
        max_x = max(p['x'] for p in aligned_points)
        max_y = max(p['y'] for p in aligned_points)
        max_value = max(max_x, max_y)
        
        # Step 4: Scale so maximum dimension = 255
        if max_value > 0:
            scale_factor = 255.0 / max_value
        else:
            scale_factor = 1.0
        
        normalized_points = []
        for p in aligned_points:
            normalized_points.append({
                'x': p['x'] * scale_factor,
                'y': p['y'] * scale_factor
            })
        
        # Step 5: Calculate deltas from normalized points + center and reduce the deltas
        self.data = []
        for i in range(len(normalized_points) - 1):
            if i % 5 == 0 and len(self.data) < max_len:
                delta_x = (normalized_points[i+1]['x'] - normalized_points[i]['x'] - mean_x) / std_x
                delta_y = (normalized_points[i+1]['y'] - normalized_points[i]['y'] - mean_y) / std_y
                self.data.append([delta_x, delta_y, 0])
        
        if self.data:
            self.data[-1][-1] = 1  # Mark the last point
        
        
    def get_data(self):
        X = torch.tensor(self.data, dtype=torch.float32)
        print(X.shape)
        actual_length = torch.tensor(min(len(self.data), self.max_len), dtype=torch.float32)

        if X.shape[0]< self.max_len:
            padding_needed = self.max_len - X.shape[0]
            padding = torch.zeros(padding_needed, 3)
            X = torch.cat([X, padding], dim=0)
        
        return X.unsqueeze(0), actual_length.unsqueeze(0) 
            
    
    def clear(self):
        self.raw_points.clear()
        self.data.clear()
    