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


/* AsyncThunk to retrieve the artists lists to act as the DB of the alternatives. */
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
    async () =>
    {
        
        return;
    }
);



const initialState =
{
    track_database: shuffleArray([...trackIDs]),
    artists_database: [],
    question: {
        lyrics_line: "",
        options: [],
        correctAnswer: {
            artist_id: "",
            artist_name: "",
            commontrack_id: ""
        }
    },
    isLoading: false,
    userLoggedIn : {
        username: "",
        isUserLoggedIn: false,
        currentPoints: 0,
        currentQuestion: 1,
    },
    scoreboard: []
}



export const quizSlice = createSlice({
    name: 'quiz',
    initialState,
    reducers: {
        turnOnSpinner: (state) => {
            state.isLoading = true;
        },
        setUser: (state, action) => {
            state.userLoggedIn = {
                username: action.payload,
                isUserLoggedIn: true,
                currentPoints: 0,
                currentQuestion: 1
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
            state.track_database = shuffleArray([...trackIDs]);
            state.userLoggedIn = {...state.userLoggedIn, currentPoints: 0, currentQuestion: 1};
        },
        registerScore: (state, action) => {
            const { username, score } = action.payload;

            const scoreObj = {
                username: username,
                score: score
            }

            /* Logic: we insert the score in the scoreboard, then sort the scoreboard array; */
            state.scoreboard.push(scoreObj);
            state.scoreboard.sort((a, b) => b.score - a.score);  // The array is pretty short, calling sort() is not that computationally onerous... */            /* If the scoreboard has more than 10 entries, we leave out the cell with the lowest score, which will be in tail. */
            if (state.scoreboard.length > 10)
                state.scoreboard.pop();
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

            /* TODO: logic to update the state. */

            return ;
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

            return ({...state, isLoading: false, artists_database: artists_database });
        },
    }
});

export const getSpinnerStatus = (state) => state.quiz.isLoading;
export const getUserLoggedIn = (state) => state.quiz.userLoggedIn;

export const { turnOnSpinner, setUser, logOutUser, newGame } = quizSlice.actions;
export default quizSlice.reducer;