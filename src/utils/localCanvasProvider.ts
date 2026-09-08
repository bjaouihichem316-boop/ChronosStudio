/**
 * Local Canvas Provider — Chronos Studio Stage 9
 *
 * Real local image generation using Canvas API.
 * Generates actual image files that can be stored and retrieved.
 * This is a zero-cost, browser-native implementation.
 */

import {
  IAIProvider,
  AIExecutionRequest,
  AIExecutionResult,
  AIProviderCapabilities,
  MediaOutput,
} from '../types/pipeline';

/**
 * Local provider that generates real images using Canvas API.
 * Produces actual PNG files with procedural generation based on prompts.
 */
export class LocalCanvasProvider implements IAIProvider {
  id = 'local-canvas';
  name = 'Local Canvas Provider';

  capabilities: AIProviderCapabilities = {
    mediaTypes: ['image'],
    maxConcurrentTasks: 2,
    supportedResolutions: ['512x512', '1024x1024', '1920x1080'],
    supportedFormats: ['png'],
  };

  /**
   * Execute image generation using Canvas API.
   * Creates a real PNG file with procedural graphics.
   */
  async execute(request: AIExecutionRequest): Promise<AIExecutionResult> {
    const startTime = Date.now();

    try {
      // Parse resolution from parameters or use default
      const resolution = this.parseResolution(request.parameters.aspectRatio);
      const [width, height] = resolution;

      // Generate image using Canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // Generate procedural image based on prompt
      this.generateProceduralImage(ctx, width, height, request.prompt);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          'image/png',
          0.95
        );
      });

      // Generate artifact ID
      const artifactId = `local-canvas-${request.taskId}-${Date.now()}`;

      // Store the blob data (will be handled by storage layer)
      // For now, we'll return the blob reference
      (window as any).__pendingCanvasBlob = (window as any).__pendingCanvasBlob || new Map();
      (window as any).__pendingCanvasBlob.set(artifactId, blob);

      const output: MediaOutput = {
        type: 'image',
        resolution: `${width}x${height}`,
        aspectRatio: request.parameters.aspectRatio || '16:9',
        format: 'png',
      };

      return {
        success: true,
        output,
        artifactId,
        generationTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        generationTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if Canvas API is available.
   */
  isAvailable(): boolean {
    if (typeof document === 'undefined') {
      return false;
    }
    const canvas = document.createElement('canvas');
    return canvas.getContext('2d') !== null;
  }

  /**
   * Parse resolution from aspect ratio string.
   */
  private parseResolution(aspectRatio: string): [number, number] {
    // Default to 1024x1024 for square
    if (!aspectRatio || aspectRatio === '1:1') {
      return [1024, 1024];
    }

    // Parse common aspect ratios
    const ratios: Record<string, [number, number]> = {
      '16:9': [1920, 1080],
      '9:16': [1080, 1920],
      '4:3': [1024, 768],
      '3:4': [768, 1024],
      '21:9': [2560, 1080],
    };

    return ratios[aspectRatio] || [1024, 1024];
  }

  /**
   * Generate a procedural image based on prompt.
   * Creates abstract graphics that represent the prompt conceptually.
   */
  private generateProceduralImage(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    prompt: string
  ): void {
    // Create gradient background based on prompt keywords
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    
    // Analyze prompt for color hints
    const colors = this.extractColorsFromPrompt(prompt);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[2]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add procedural elements
    this.addProceduralElements(ctx, width, height, prompt);

    // Add text overlay with prompt (for debugging/identification)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = `${Math.min(width, height) * 0.03}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Chronos Studio - Local Generation', width / 2, height - 30);

    // Add timestamp
    ctx.font = `${Math.min(width, height) * 0.02}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(new Date().toISOString(), width / 2, height - 10);
  }

  /**
   * Extract color palette from prompt keywords.
   */
  private extractColorsFromPrompt(prompt: string): [string, string, string] {
    const lowerPrompt = prompt.toLowerCase();

    // Historical/documentary themes
    if (lowerPrompt.includes('constantinople') || lowerPrompt.includes('byzantine')) {
      return ['#8B4513', '#DAA520', '#4A4A4A']; // Brown, gold, gray
    }
    if (lowerPrompt.includes('ottoman') || lowerPrompt.includes('turkish')) {
      return ['#8B0000', '#FFD700', '#006400']; // Red, gold, green
    }
    if (lowerPrompt.includes('medieval') || lowerPrompt.includes('castle')) {
      return ['#696969', '#808080', '#A9A9A9']; // Grays
    }
    if (lowerPrompt.includes('battle') || lowerPrompt.includes('war')) {
      return ['#8B0000', '#2F4F4F', '#696969']; // Dark red, slate, gray
    }

    // Nature themes
    if (lowerPrompt.includes('forest') || lowerPrompt.includes('tree')) {
      return ['#228B22', '#006400', '#8B4513']; // Greens and brown
    }
    if (lowerPrompt.includes('ocean') || lowerPrompt.includes('sea')) {
      return ['#006994', '#40E0D0', '#F0E68C']; // Blues and sand
    }
    if (lowerPrompt.includes('mountain') || lowerPrompt.includes('rock')) {
      return ['#708090', '#A9A9A9', '#D3D3D3']; // Grays
    }

    // Default palette
    return ['#4A90E2', '#7B68EE', '#9370DB']; // Blues and purples
  }

  /**
   * Add procedural visual elements to the canvas.
   */
  private addProceduralElements(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    prompt: string
  ): void {
    const lowerPrompt = prompt.toLowerCase();

    // Add geometric shapes based on prompt
    const numShapes = 5 + Math.floor(Math.random() * 10);

    for (let i = 0; i < numShapes; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 20 + Math.random() * 100;

      ctx.save();
      ctx.globalAlpha = 0.3 + Math.random() * 0.4;

      // Different shapes based on prompt
      if (lowerPrompt.includes('building') || lowerPrompt.includes('architecture')) {
        // Rectangles for buildings
        ctx.fillStyle = `hsl(${Math.random() * 60 + 20}, 50%, 50%)`;
        ctx.fillRect(x, y, size, size * 1.5);
      } else if (lowerPrompt.includes('character') || lowerPrompt.includes('person')) {
        // Circles for figures
        ctx.fillStyle = `hsl(${Math.random() * 360}, 60%, 60%)`;
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Mixed shapes
        const shapeType = Math.floor(Math.random() * 3);
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
        
        if (shapeType === 0) {
          ctx.beginPath();
          ctx.arc(x, y, size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (shapeType === 1) {
          ctx.fillRect(x, y, size, size);
        } else {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + size, y + size);
          ctx.lineTo(x - size, y + size);
          ctx.closePath();
          ctx.fill();
        }
      }

      ctx.restore();
    }

    // Add some lines for texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }
  }

  /**
   * Get the generated blob for an artifact ID.
   * This is used by the storage layer to retrieve the actual file.
   */
  static getGeneratedBlob(artifactId: string): Blob | null {
    const blobMap = (window as any).__pendingCanvasBlob;
    if (!blobMap) return null;
    return blobMap.get(artifactId) || null;
  }

  /**
   * Clean up stored blob after it's been saved.
   */
  static cleanupBlob(artifactId: string): void {
    const blobMap = (window as any).__pendingCanvasBlob;
    if (blobMap) {
      blobMap.delete(artifactId);
    }
  }
}
