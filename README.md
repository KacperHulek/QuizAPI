## Prerequisites:
1. Ensure you have Docker installed on your system. You can download it from [Docker's official website](https://www.docker.com/get-started).

2. Have Node.js and npm (Node Package Manager) installed on your system. You can download and install them from [Node.js official website](https://nodejs.org/en/download/).

## Steps to Run the Application:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/KacperHulek/QuizAPI.git
   ```

2. **Navigate to Project Directory:**
   ```bash
   cd QuizAPI
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Set Up Environment Variables:**
   Create a .env file in the root directory of your project and set up your PostgreSQL database configurations. Here's an example .env file:
   ```plaintext
   DB_TYPE=postgres
   PG_HOST=db
   PG_USER=postgres
   PG_PASSWORD=postgres
   PG_DB=postgres
   PG_PORT=5432
   PG_IMAGE=postgres:12
   ```


5. **Run Docker Compose:**
   ```bash
   docker-compose up -d
   ```

6. **Verify the Application:**
After running the container, your Nest.js GraphQL API should be accessible. You can verify it by visiting `http://localhost:3000/graphql` in your web browser or using tools like Postman. If you've changed the port configuration, make sure to replace `3000` with the correct port number accordingly.

## Example GraphQL Queries and Mutations:
### Example Mutation: Create a Quiz

To create a new quiz using the GraphQL API, you can execute the following mutation:

```graphql
mutation {
  createQuiz(createQuizInput: {
    name: "Math Quiz"
    questions: [
      {
        content: "What is 2 + 2?"
        type: "Single"
        answers: [
          { content: "4", isCorrect: true }
          { content: "2", isCorrect: false }
          { content: "3", isCorrect: false }
        ]
      },
      {
        content: "Which of these numbers are positive."
        type: "Multiple"
        answers: [
          { content: "0", isCorrect: false }
          { content: "-2", isCorrect: false }
          { content: "3", isCorrect: true }
          { content: "5", isCorrect: true }
        ]
      },
      {
        content: "Sort the numbers from the smallest to the largest."
        type: "Sort"
        answers: [
          { content: "1", sortOrder: 0}
          { content: "3", sortOrder: 2}
          { content: "2", sortOrder: 1}
        ]
      },
      {
        content: "Calculate the area of a rectangle with length 4 and width 5. Type the answer below (in numbers not words)."
        type: "Text"
        answers:[
          {content: "20"}
        ]
      },
    ]
  }) {
    id
    name
    questions{
      id
      content
      type
      predefinedAnswers{
        id
        content
      }
      textAnswers{
        id
      }
      sortAnswers{
        id
        content
      }
    }
  }
}
```
This mutation creates a quiz named "Math Quiz" with four questions of different types: single correct answer, multiple correct answers, sorting, and plain text answer. After executing this mutation, you will receive the ID, name, and details of the questions created for the quiz.

### Example Queries: Fetch Quizzes
You can fetch all quizzes or a specific quiz by its ID.
```graphql
query {
  getAllQuizzes {
    id
    name
    questions {
      id
      content
      type
      textAnswers {
        id
        content
      }
      predefinedAnswers {
        id
        content
        isCorrect
      }
      sortAnswers {
        id
        content
        order
      }
    }
  }
}
```

### Example Query: Fetch a Quiz
Fetch a specific quiz with a given id.
```graphql
query{
  getQuiz(id:2){
    id
    name
    questions{
      id
      content
      type
      textAnswers{
        id
        content
      }
      sortAnswers{
        id
        content
      }
      predefinedAnswers{
        id
        content
      }
    }
  }
}
```
### Example Query: Fetch a Quiz with correct answers provided
```graphql
query{
  getQuiz(id:1){
    id
    name
    questions{
      id
      content
      type
      textAnswers{
        id
        content
      }
      sortAnswers{
        id
        content
        order
      }
      predefinedAnswers{
        id
        content
        isCorrect
      }
    }
  }
}
```
### Example Query: Check Answers and Score
You can check answers submitted by users and calculate the score for a quiz. Here's an example GraphQL query to check answers and get the score:
```graphql
query {
  checkAnswers(
    quizId: 1
    answers: [
      {
        questionId: 2
        order: [1,3,2] # In the brackets are always the id's of the answers 
      }
      {
        questionId: 3
        content: "20"
      }
      {
        questionId: 4
        selectedAnswers: [6,7]
      }
      {
        questionId: 1
        selectedAnswers: [1]
      }
      
    ]
  ){obtainedPoints,maxPoints}
}
```
