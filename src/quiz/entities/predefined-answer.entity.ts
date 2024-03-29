import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from './question.entity';

@Entity()
@ObjectType()
export class PredefinedAnswer {
  @PrimaryGeneratedColumn()
  @Field((type) => Int)
  id: number;

  @Column()
  @Field()
  content: string;

  @ManyToOne(() => Question, (question) => question.predefinedAnswers)
  @Field((type) => Question)
  question: Question;

  @Column()
  @Field()
  isCorrect: boolean;
}
