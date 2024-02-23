import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Quiz } from './quiz.entity';

@Entity()
@ObjectType()
export class Question {
  @PrimaryGeneratedColumn()
  @Field((type) => Int)
  id: number;

  @Column()
  @Field()
  content: string;

  @Column()
  @Field()
  type: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  @Field((type) => Quiz)
  quiz: Quiz;
}
