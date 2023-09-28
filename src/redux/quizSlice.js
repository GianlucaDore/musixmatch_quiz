import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { redirect } from "react-router-dom";



function shuffleArray(array) // Fisher-Yates algorithm to generate permutations. Useful to shuffle an array.
{
    for (let i = array.length - 1; i > 0; i--) // Iterates from last to first element of the array
    {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];  // Swaps each element with another element of the same random range
    }

    return array;
}

function initializeScoreBoard()
{
    const scoreboard = [];
    for (let i=0; i<10; i++)
    { 
        /* We underdimension "score" to -9999 (unreachable score in this implementation) because -Infinity is lost when persisting the state,
           since it gets lost when the redux-persist library calls the JSON.stringify() method on it to serialize the state to persist it. */
        const defaultScore = {   
            username: "-----",
            score: -9999
        };
        scoreboard.push(defaultScore);
    }

    return scoreboard;
}


/* AsyncThunk to retrieve the artists list to act as the DB of the alternatives. */
export const fetchDatabase = createAsyncThunk('quiz/fetchDatabase',
    async () =>
    {
        const htmlquery = "chart.tracks.get?chart_name=top&page=1&page_size=20&country=it&f_has_lyrics=1"
        const apikey = "4c1ba2ca3c12e38d88e4b8d38b05f5d3"

        /* Now we'll fetch the top 10 tracks chart for Italy from Musixmatch. We'll make use of both commontrakc_ID and artist details. */
        const response = await fetch(encodeURI('https://api.musixmatch.com/ws/1.1/' + htmlquery + '&apikey=' + apikey), {
            "method" : 'GET',
            "headers" : {}
        }).catch((err) => ("There was an error fetching database: " + err));

        if (!response.ok)
        {
            console.log("Call response not ok!");
            return(redirect("/notfound"));
        }
        
        const res = await response.json();

        /* Let's fill the database with all the artists' and tracks' details that we've just fetched: */
        let tracks_database = [];
        let artists_database = [];
        for (let t of res.message.body.track_list)
        {
            tracks_database.push(t.track.commontrack_id);
            const artsObj = {
                artist_id: t.track.artist_id,
                artist_name: t.track.artist_name
            };
            artists_database.push(artsObj);
        }

        return { tracks_database, artists_database };
    }
);



export const fetchQuestion = createAsyncThunk('quiz/fetchQuestion',
    async (_, {getState}) =>
    {
        /* Let's fetch the random lyrics needed for the question. */
        const apikey = "4c1ba2ca3c12e38d88e4b8d38b05f5d3";

        /* We can call Math.random() since we're in a thunk, not in a reducer. */
        const initialNumberOfTracksInTheDB = 20;  // As of current implementation (N=20), database has 20 tracks to choose the question from.
        const currentTracksInTheDB = initialNumberOfTracksInTheDB - getState().quiz.userLoggedIn.questionIndex + 1  // At first execution of this function, questionIndex is at 1, so the pool should be 19+1.
        const randomIDIndex = getRandomIndex(currentTracksInTheDB); // We will exclude this track we've just chosen to prevent duplicated questions, so we save this index.
        const randomID = getState().quiz.tracks_database[randomIDIndex];  // We access the global state through the getState parameter of the thunk API, so we can retrieve the commontrack_ID of the chosen track.

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
            lyrics_body = lyrics_body.split("*******")[0];  // Let's get rid of the disclaimer.
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

        /* We take 2 other random artists from the artists_array to make the alternative choices: */
        const alternatives = [];
        /* We have to be careful that the randomIndex function doesn't return as an alternative choice for the question the already chosen artist for the question's answer: */
        let indexOfAlternative1 = getRandomIndex(20);
        while (correctAnswer.artist_id === getState().quiz.artists_database[indexOfAlternative1].artist_id)  // 'while' loop because the getRandomIndex may return the same index consecutively (rare case, but it may happen).
        {
            indexOfAlternative1 = getRandomIndex(20);
        }
        /* Same thing must be done with the second alternative, that must be unique aswell, meaning that it must be different from the correctAnswer and also the alternative1 : */
        let indexOfAlternative2 = getRandomIndex(20);
        while (correctAnswer.artist_id === getState().quiz.artists_database[indexOfAlternative2].artist_id || indexOfAlternative2 === indexOfAlternative1)
        {
            indexOfAlternative2 = getRandomIndex(20);
        }

        /* At this point, we should have our unique options for the question. Let's register them in a variable, then into the store. */
        alternatives.push(getState().quiz.artists_database[indexOfAlternative1]);  
        alternatives.push(getState().quiz.artists_database[indexOfAlternative2]);  // Actually, no need to exclude the artists already chosen like we had to for the tracks.
        alternatives.push(correctAnswer);
        /* Let's shuffle the alternatives to prevent the correct answer from being always given as the last option: */
        shuffleArray(alternatives);  // The Math.random() call is permitted since we're in a thunk and not in a reducer.
        
        /* In order to prevent duplicated questions, we pass the randomIDIndex generated to access the tracks_database,
           so that the reducer function can exclude (cut out from the session database) the already-given question from the pool of next questions of the quiz. */
        return { alternatives, correctAnswer, lyrics_body, randomIDIndex };  
    }
);


function getRandomIndex(max)
{
    const min=0;  // The start of the interval from which we choose the index is always 0 (the index must redirect us to an array cell).
    /* We proceed to select a random index, to pick a commontrack_ID from the tracks_database array in the store that acts as our question DB. */
    const randomIndex = Math.floor(Math.random() * (max - min)) + min; 
    return randomIndex;
}



const initialState =
{
    tracks_database: [],
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
    gameHistory: [],
    scoreboard: initializeScoreBoard()
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
            state.tracks_database = []; 
            state.isPageLoading = true; 
            state.userLoggedIn = {...state.userLoggedIn, currentPoints: 0, questionIndex: 1};
        },
        registerScore: (state, action) => {

            /* Let's take care of the scoreboard first. */
            const scoreObj = {
                username: state.userLoggedIn.username,
                score: state.userLoggedIn.currentPoints
            }

            /* Logic: we insert the score in the scoreboard, then sort the scoreboard array; */
            state.scoreboard.push(scoreObj);
            state.scoreboard.sort((a, b) => b.score - a.score);  // The array is pretty short, calling sort() is not that computationally onerous... */            /* If the scoreboard has more than 10 entries, we leave out the cell with the lowest score, which will be in tail. */
            if (state.scoreboard.length > 10)
                state.scoreboard.pop();  // If there are more than 10 entries in the scoreboard, we leave out the last one.

            /* Now that we handled the scoreboard after the given result, time to update the user's game history. */
            const indexOfUsernameInGameHistory = state.gameHistory.findIndex((i) => (i.username === state.userLoggedIn.username))

            if ( indexOfUsernameInGameHistory >= 0)  // Let's check if the user already exists in the DB.
            {
                /* Score history: head deletion, tail insertion. */
                if (state.gameHistory[indexOfUsernameInGameHistory].scores.length ===5)
                    { state.gameHistory[indexOfUsernameInGameHistory].scores.shift(); }  // We remove the array's first element (the oldest) if the history is full.
                
                state.gameHistory[indexOfUsernameInGameHistory].scores.push(state.userLoggedIn.currentPoints);
            }

            else  // If the user doesn't exist in the database, we create a "profile" (game history) for them.
            {
                const newUserInTheHistory = {
                    username: state.userLoggedIn.username,
                    scores: [state.userLoggedIn.currentPoints]
                }
                state.gameHistory.push(newUserInTheHistory);
            }
        },
        addPoints: (state, action) => {
            state.userLoggedIn.currentPoints += (100 + action.payload); // More points for quick answers.
            state.userLoggedIn.questionIndex += 1;
        },
        subtractPoints: (state) => {
            state.userLoggedIn.currentPoints -= 50;
            state.userLoggedIn.questionIndex += 1;
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

            const updatedTrackIDs = [...state.tracks_database];  // By using splice, we need to make a copy of the state array to adhere to Redux state immutability.
            updatedTrackIDs.splice(action.payload.randomIDIndex, 1); // We remove 1 item from the state tracks_database, at the desired position.

            return ({...state, tracks_database: updatedTrackIDs, question: question, isQuizCardLoading: false});
        },
        [fetchDatabase.pending] : () => {
            console.log("Promise fetchDatabase is pending.");
        },
        [fetchDatabase.rejected] : (state, action) => {
            console.error("Promise fetchDatabase was rejected; error: " + action.payload);
        },
        [fetchDatabase.fulfilled] : (state, action) => {
            console.log("Retrieved the database for the quiz (Promise fulfilled).");

            /* We've fetched the artists and the track list, we just need to set them in the state as the database. */
            const { tracks_database, artists_database } = action.payload;

            return ({...state, isPageLoading: false, tracks_database: tracks_database, artists_database: artists_database });
        },
    }
});

export const getClipLoaderStatus = (state) => state.quiz.isPageLoading;
export const getClockLoaderStatus = (state) => state.quiz.isQuizCardLoading;
export const getUserLoggedIn = (state) => state.quiz.userLoggedIn;
export const getQuestion = (state) => state.quiz.question;
export const getQuestionIndex = (state) => state.quiz.userLoggedIn.questionIndex;
export const getLeaderboards = (state) => state.quiz.scoreboard;
export const getUserGameHistory = (state) => {
                                                const index = state.quiz.gameHistory.findIndex((i) => i.username === state.quiz.userLoggedIn.username);
                                                if (index === -1)
                                                    return null;
                                                else
                                                    return state.quiz.gameHistory[index].scores;
                                             };                           

export const { turnOnSpinner, setUser, logOutUser, newGame, addPoints, subtractPoints, noPoints, registerScore } = quizSlice.actions;
export default quizSlice.reducer;