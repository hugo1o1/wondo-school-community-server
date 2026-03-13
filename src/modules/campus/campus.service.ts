import { Injectable } from '@nestjs/common';

@Injectable()
export class CampusService {
  async getGrades(_userId: number) {
    // Mock 成绩数据
    return {
      semester: '2025-2026 第一学期',
      gpa: 3.72,
      courses: [
        { name: '高等数学', credit: 4, score: 92, grade: 'A' },
        { name: '大学英语', credit: 3, score: 88, grade: 'B+' },
        { name: '数据结构', credit: 3, score: 95, grade: 'A' },
        { name: '计算机网络', credit: 3, score: 85, grade: 'B+' },
        { name: '操作系统', credit: 3, score: 90, grade: 'A-' },
        { name: '线性代数', credit: 3, score: 82, grade: 'B' },
      ],
    };
  }

  async getSchedule(_userId: number) {
    // Mock 课表数据
    return {
      semester: '2025-2026 第一学期',
      week: 10,
      schedule: [
        { day: 1, period: '1-2', name: '高等数学', room: 'A301', teacher: '张教授' },
        { day: 1, period: '3-4', name: '大学英语', room: 'B205', teacher: '李老师' },
        { day: 2, period: '1-2', name: '数据结构', room: 'C102', teacher: '王教授' },
        { day: 2, period: '5-6', name: '计算机网络', room: 'D401', teacher: '陈老师' },
        { day: 3, period: '1-2', name: '高等数学', room: 'A301', teacher: '张教授' },
        { day: 3, period: '3-4', name: '操作系统', room: 'C203', teacher: '刘教授' },
        { day: 4, period: '1-2', name: '线性代数', room: 'A205', teacher: '赵老师' },
        { day: 4, period: '3-4', name: '数据结构', room: 'C102', teacher: '王教授' },
        { day: 5, period: '1-2', name: '大学英语', room: 'B205', teacher: '李老师' },
        { day: 5, period: '5-6', name: '计算机网络', room: 'D401', teacher: '陈老师' },
      ],
    };
  }
}
