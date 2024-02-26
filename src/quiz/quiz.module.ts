import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizResolver } from './quiz.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { TextAnswer } from './entities/text-answer.entity';
import { PredefinedAnswer } from './entities/predefined-answer.entity';
import { SortAnswer } from './entities/sort-answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quiz,
      Question,
      TextAnswer,
      PredefinedAnswer,
      SortAnswer,
      QuizService,
    ]),
  ],
  providers: [QuizResolver, QuizService],
  exports: [QuizService],
})
export class QuizModule {}
