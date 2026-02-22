import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
import os
import json

# Create plots folder if it doesn't exist
plots_folder = "plots"
if not os.path.exists(plots_folder):
    os.makedirs(plots_folder)
    print(f"Created {plots_folder} folder")

# Get all npz files from quickdraw_data folder
quickdraw_folder = "quickdraw_data"
npz_files = sorted([f for f in os.listdir(quickdraw_folder) if f.endswith('.npz')])

# Filter out .full.npz files to avoid duplicates, only keep the regular ones
npz_files = [f for f in npz_files if not f.endswith('.full.npz')]

print(f"Found {len(npz_files)} npz files to process\n")



def plot():
    # Dictionary to store statistics for all categories
    stats_all_categories = {}
    
    # Process files in groups of 20
    group_size = 20
    for group_idx in range(0, len(npz_files), group_size):
        
        group_files = npz_files[group_idx:group_idx + group_size]
        group_number = (group_idx // group_size) + 1
        
        print(f"Processing group {group_number} ({len(group_files)} files)...")
        
        # Create figure with subplots for this group
        fig, axes = plt.subplots(4, 5, figsize=(20, 16))
        axes = axes.flatten()
        
        for plot_idx, npz_file in enumerate(group_files):
            
            npz_path = os.path.join(quickdraw_folder, npz_file)
            ax = axes[plot_idx]
            
            try:
                # Load the data
                data = np.load(npz_path, allow_pickle=True, encoding='latin1')
                
                # Get the training data
                if 'train' not in data.files:
                    ax.text(0.5, 0.5, f"No 'train' key", ha='center', va='center')
                    ax.set_title(npz_file.replace('.npz', ''), fontsize=10)
                    continue
                
                drawings = data['train']
                category_name = npz_file.replace('.npz', '')
                
                # Analyze sequence lengths
                sequence_lengths = []
                delta_x_values = []
                delta_y_values = []
                
                for idx, drawing in enumerate(drawings):
                    if isinstance(drawing, np.ndarray) and len(drawing.shape) == 2:
                        pen_flags = drawing[:, 2]
                        delta_x_values.extend(drawing[:, 0])
                        delta_y_values.extend(drawing[:, 1])
                        # Find all indices where pen is lifted (flag=1)
                        pen_up_indices = np.where(pen_flags == 1)[0]
                        
                        # Calculate distances between consecutive pen-up events
                        if len(pen_up_indices) > 0:
                            # Distance from start to first pen-up
                            if pen_up_indices[0] > 0:
                                sequence_lengths.append(pen_up_indices[0])
                            
                            # Distances between consecutive pen-ups
                            for i in range(len(pen_up_indices) - 1):
                                dist = pen_up_indices[i + 1] - pen_up_indices[i]
                                if dist > 0:
                                    sequence_lengths.append(dist)
                            
                            # Distance from last pen-up to end
                            if pen_up_indices[-1] < len(pen_flags) - 1:
                                sequence_lengths.append(len(pen_flags) - pen_up_indices[-1] - 1)
                        else:
                            # No pen-ups, entire drawing is one sequence
                            sequence_lengths.append(len(pen_flags))
                
                # Plot histogram on subplot
                ax.hist(sequence_lengths, bins=50, edgecolor='black', alpha=0.7, color='#4ECDC4')
                ax.set_xlabel('Length', fontsize=8)
                ax.set_ylabel('Frequency', fontsize=8)
                
                # Calculate means and stds
                mean_delta_x = np.mean(delta_x_values) if delta_x_values else 0
                mean_delta_y = np.mean(delta_y_values) if delta_y_values else 0
                std_delta_x = np.std(delta_x_values) if delta_x_values else 0
                std_delta_y = np.std(delta_y_values) if delta_y_values else 0
                
                # Store statistics for this category
                stats_all_categories[category_name] = {
                    "mean_delta_x": float(mean_delta_x),
                    "std_delta_x": float(std_delta_x),
                    "mean_delta_y": float(mean_delta_y),
                    "std_delta_y": float(std_delta_y),
                    "num_drawings": len(sequence_lengths)
                }
                
                title = f'{category_name}\n(n={len(sequence_lengths)}, μ_Δx={mean_delta_x:.2f}±{std_delta_x:.2f}, μ_Δy={mean_delta_y:.2f}±{std_delta_y:.2f})'
                ax.set_title(title, fontsize=9)
                ax.tick_params(labelsize=8)
                
                print(f"  ✓ {npz_file}")
                
            except Exception as e:
                ax.text(0.5, 0.5, f"Error: {str(e)[:30]}", ha='center', va='center', fontsize=8)
                ax.set_title(npz_file.replace('.npz', ''), fontsize=10)
                print(f"  ✗ {npz_file}: {e}")
        
        # Hide unused subplots
        for idx in range(len(group_files), len(axes)):
            axes[idx].axis('off')
        
        plt.suptitle(f'Stroke Length Distributions - Group {group_number}', fontsize=16, y=0.995)
        plt.tight_layout()
        
        # Save the grouped figure
        plot_filename = os.path.join(plots_folder, f"group_{group_number:02d}_sequence_lengths.png")
        plt.savefig(plot_filename, dpi=100, bbox_inches='tight')
        print(f"  Saved: {plot_filename}\n")
        
        plt.close()

    print(f"All plots saved to {plots_folder}/ folder!")
    
    # Save statistics to JSON file
    stats_filename = os.path.join(plots_folder, "category_statistics.json")
    with open(stats_filename, 'w') as f:
        json.dump(stats_all_categories, f, indent=4)
    print(f"Statistics saved to {stats_filename}")
    
    return stats_all_categories

if __name__ == "__main__":
    plot()



