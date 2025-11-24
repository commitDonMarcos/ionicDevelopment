import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  async getResultsForTask(taskId: string): Promise<any> {
    // Mock implementation: Replace with actual API call or logic
    return [
      { id: '1', taskId, result: 'Pass' },
      { id: '2', taskId, result: 'Fail' },
    ];
  }
}
