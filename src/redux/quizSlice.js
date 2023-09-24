import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { trackIDs } from "../track_ids";
import { redirect } from "react-router-dom";



function shuffleArray(array) 
{
    for (let i = array.length - 1; i > 0; i--) 
    {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}


/* AsyncThunk to retrieve the artists list to act as the DB of the alternatives. */
export const fetchArtists = createAsyncThunk('quiz/fetchArtists',
    async () =>
    {
        const htmlquery = "chart.artists.get?chart_name=top&page=1&page_size=30&country=uk&f_has_lyrics=1"
        const apikey = "4c1ba2ca3c12e38d88e4b8d38b05f5d3"

        /* Now we'll fetch the top 10 artists chart for uk from Musixmatch: they'll act as our artists database for the quiz options: */
        const response = await fetch(encodeURI('https://api.musixmatch.com/ws/1.1/' + htmlquery + '&apikey=' + apikey), {
            "method" : 'GET',
            "headers" : {}
        }).catch((err) => ("There was an error fetching artists' database: " + err));

        if (!response.ok)
        {
            console.log("Call response not ok!");
            return(redirect("/notfound"));
        }
        
        const res = await response.json();

        /* Let's fill the database with all the artists' details that we've just fetched: */
        let artists_database = [];
        for (let a of res.message.body.artist_list)
        {
            const artsObj = {
                artist_id: a.artist.artist_id,
                artist_name: a.artist.artist_name
            };
            artists_database.push(artsObj);
        }

        return artists_database;
    }
);



export const fetchQuestion = createAsyncThunk('quiz/fetchQuestion',
    async (_, {getState}) =>
    {
        /* Let's fetch the random lyrics needed for the question. */
        const apikey = "4c1ba2ca3c12e38d88e4b8d38b05f5d3";
        /* We can call Math.random() since we're in a thunk, not in a reducer. */
        const numberOfTracksInTheFile = 20;  // As of now, track_IDs.js has 20 tracks to choose the question from.
        const calcualtion = numberOfTracksInTheFile - getState().quiz.userLoggedIn.questionIndex + 1
        const randomIDIndex = getRandomIndex(calcualtion); // We exclude the track chosen to prevent duplicated questions.
        const randomID = getState().quiz.track_database[randomIDIndex];  // We access the global state through the getState parameter of the thunk API.

        const apiMethod = "track.lyrics.get?commontrack_id="
        const response = await fetch(encodeURI('https://api.musixmatch.com/ws/1.1/' + apiMethod + randomID + '&apikey=' + apikey), {
            "method" : 'GET',
            "headers" : {}
        }).catch((err) => ("There was an error fetching question lyrics: " + err));

        if (!response.ok)
        {
            console.log("Call response not ok!");
            return(redirect("/notfound"));
        }
        
        const res = await response.json();

        let lyrics_body = res.message.body.lyrics.lyrics_body; // We have now the question body.
        if (lyrics_body.includes("*******"))
        {
            lyrics_body = lyrics_body.split("*******")[0];  // Let's get rid of the disclaimer for now; we'll include it manually in a different style/font.
        }

        /* We shall now fetch the artist details of this lyrics, it will be our answer. */
        const response2 = await fetch(encodeURI('https://api.musixmatch.com/ws/1.1/track.get?commontrack_id=' + randomID + '&apikey=' + apikey), {
            "method" : 'GET',
            "headers" : {}
        }).catch((err) => ("There was an error fetching question artist: " + err));

        if (!response2.ok)
        {
            console.log("Call response not ok!");
            return(redirect("/notfound"));
        }
        
        const res2 = await response2.json();

        const correctAnswer = {
            artist_id: res2.message.body.track.artist_id,
            artist_name: res2.message.body.track.artist_name,
        };

        /* We take 2 other random artists from the artists array to make the alternatives: */
        const alternatives = [];
        alternatives.push(getState().quiz.artists_database[getRandomIndex(30)]);  // 30 cause we have fetched the top 30 artists at the start of the quiz (fetchArtists).
        alternatives.push(getState().quiz.artists_database[getRandomIndex(30)]);  // Actually, no need to exclude the artists already chosen like we had to for the tracks. 30 stays a constant here.
        alternatives.push(correctAnswer);
        /* Let's shuffle the alternatives to prevent the correct answer from being always given as the last option: */
        shuffleArray(alternatives);
        
        /* In order to prevent duplicated questions, we pass the random index generated to access the tracksID database,
           so that the reducer function can exclude the already given question from the pool of next questions in the quiz. */
        return { alternatives, correctAnswer, lyrics_body, randomIDIndex };  
    }
);

function getRandomIndex(max)
{
    const min=0;
    /* We proceed to select a random index to pick from the track_ID array in the store, that acts as our question DB. */
    const randomIndex = Math.floor(Math.random() * (max - min)) + min; 
    return randomIndex;
}



const initialState =
{
    track_database: shuffleArray([...trackIDs]),
    artists_database: [],
    question: {
        lyrics_line: "",
        options: [{artist_name: "", artist_id: ""}, {artist_name: "", artist_id: ""}, {artist_name: "", artist_id: ""}],
        correctAnswer: {
            artist_id: "",
            artist_name: "",
            commontrack_id: ""
        }
    },
    isPageLoading: false,
    isQuizCardLoading: false,
    userLoggedIn : {
        username: "",
        isUserLoggedIn: false,
        currentPoints: 0,
        questionIndex: 1,
    },
    scoreboard: []
}



export const quizSlice = createSlice({
    name: 'quiz',
    initialState,
    reducers: {
        turnOnSpinner: (state, action) => {
            if (action.payload === "page")
                state.isPageLoading = true;
            if (action.payload === "card")
                state.isQuizCardLoading = true;
        },
        setUser: (state, action) => {
            state.userLoggedIn = {
                username: action.payload,
                isUserLoggedIn: true,
                currentPoints: 0,
                questionIndex: 1
            };
        },
        logOutUser: (state) => {
            state.userLoggedIn = {
                username: "",
                isUserLoggedIn: false,
                currentPoints: 1
            };
        },
        newGame: (state) => {
            state.track_database = [...trackIDs];  // We restore all the trackIDs of the file in our database for each new game.
            state.userLoggedIn = {...state.userLoggedIn, currentPoints: 0, questionIndex: 1};
        },
        registerScore: (state, action) => {
            /* 
            const { username, score } = action.payload;
            */ 

            const scoreObj = {
                username: state.userLoggedIn.username,
                score: state.userLoggedIn.currentPoints
            }

            /* Logic: we insert the score in the scoreboard, then sort the scoreboard array; */
            state.scoreboard.push(scoreObj);
            state.scoreboard.sort((a, b) => b.score - a.score);  // The array is pretty short, calling sort() is not that computationally onerous... */            /* If the scoreboard has more than 10 entries, we leave out the cell with the lowest score, which will be in tail. */
            if (state.scoreboard.length > 10)
                state.scoreboard.pop();  // If there are more than 10 entries in the scoreboard, we leave out the last one.
        },
        addPoints: (state) => {
            state.userLoggedIn.currentPoints += 100;
            state.userLoggedIn.questionIndex+= 1;
        },
        subtractPoints: (state) => {
            state.userLoggedIn.currentPoints -= 50;
            state.userLoggedIn.questionIndex+= 1;
        },
        noPoints: (state) => {
            state.userLoggedIn.questionIndex += 1;
        }
    },
    extraReducers: {
        [fetchQuestion.pending] : () => {
            console.log("Promise fetchQuestion is pending.");
        },
        [fetchQuestion.rejected] : (state, action) => {
            console.error("Promise fetchQuestion was rejected; error: " + action.payload);
        },
        [fetchQuestion.fulfilled] : (state, action) => {
            console.log("Retrieving question for the quiz (Promise fulfilled).");

            const question = {
                lyrics_line: action.payload.lyrics_body,
                options: action.payload.alternatives,
                correctAnswer: action.payload.correctAnswer
            };

            console.trace();
            const updatedTrackIDs = [...state.track_database];  // By using splice, we need to make a copy of the state array to adhere to Redux state immutability.
            updatedTrackIDs.splice(action.payload.randomIDIndex, 1); // We remove 1 item from the state track_database, at the desired position.

            return ({...state, track_database: updatedTrackIDs, question: question, isQuizCardLoading: false});
        },
        [fetchArtists.pending] : () => {
            console.log("Promise fetchArtists is pending.");
        },
        [fetchArtists.rejected] : (state, action) => {
            console.error("Promise fetchArtists was rejected; error: " + action.payload);
        },
        [fetchArtists.fulfilled] : (state, action) => {
            console.log("Retrieved the artists for the quiz DB (Promise fulfilled).");

            /* We've fetched the artists list, we just need to set them in the state as the multiple choice database. */
            const artists_database = action.payload;

            return ({...state, isPageLoading: false, artists_database: artists_database });
        },
    }
});

export const getClipLoaderStatus = (state) => state.quiz.isPageLoading;
export const getClockLoaderStatus = (state) => state.quiz.isQuizCardLoading;
export const getUserLoggedIn = (state) => state.quiz.userLoggedIn;
export const getQuestion = (state) => state.quiz.question;
export const getQuestionIndex = (state) => state.quiz.userLoggedIn.questionIndex;
export const getLeaderboards = (state) => state.quiz.scoreboard;

export const { turnOnSpinner, setUser, logOutUser, newGame, addPoints, subtractPoints, noPoints, registerScore } = quizSlice.actions;
export default quizSlice.reducer;