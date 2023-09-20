import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchQuestions = createAsyncThunk('quiz/fetchQuestions',
    async () =>
    {
        return;
    }
);

const initialState =
{
    questions: [],
    isLoading: false
}

export const quizSlice = createSlice({
    name: 'quiz',
    initialState,
    reducers: {
        turnOnSpinner: (state) => {
            state.isLoading = true;
        }
    },
    extraReducers: {
        [fetchQuestions.pending] : () => {
            console.log("Promise fetchQuestions is pending.");
        },
        [fetchQuestions.rejected] : (state, action) => {
            console.error("Promise fetchQuestions was rejected; error: " + action.payload);
        },
        [fetchQuestions.fulfilled] : (state, action) => {
            console.log("Retrieving questions from the quiz (Promise fulfilled).");

            /* TODO: logic to update the state. */

            return ;
        }
    }
});

export const getSpinnerStatus = (state) => state.quiz.isLoading;

export const { turnOnSpinner } = quizSlice.actions;
export default quizSlice.reducer;