import { Injectable } from '@nestjs/common';
import ollama from 'ollama'


@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    return 'Hello World!';
  }


  generatePrompt(context: string) {
    return `
    You are a fiction story writer. Follow the Plot below line by line and add missing details like background, character details with motivations and dialog to move the plot forward.

    Make sure you DESCRIBE THE SCENE in a way the reader can VISUALIZE it. Read the entire Plot below to construct a coherent story. Use formatting for Chapter titles and dialog.
    THINK STEP BY STEP. SHOW, DON'T TELL.

    Write a 50 words FIRST CHAPTER ONLY using the PLOT below.
    
    ${context} 
    `
  }

  async generateStory(context: string) {
    const prompt = this.generatePrompt(context);
    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [{ role: 'user', content: prompt }],
    })

    return response.message.content
  }
}

