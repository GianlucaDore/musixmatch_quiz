# Who's Singing?

This is my ReactJS implementation of the React Quiz app for the Musixmatch test. The app consists of three pages/screens: Home, Quiz, Leaderboards, plus a NotFound that is rendered in case the user requests an invalid URL. 

Home acts as a landing page for the user, and it makes use of React's conditional rendering to display either a form to log in or a box that lets the user view the results of its last matches. A "Rules" box is displayed before login, as well as a logo that redirects to Musixmatch's official website.

Quiz acts as a wrapper for the QuizCard component, that implements the game itself. Once rendered, through an async thunk, it makes the logic fetch the top 10 tracks for Italy from Musixmatch, creating the database of the tracks for the quiz, as well as the database of the artists (that act as the answer's options). A variable stored in the store, called questionIndex tracks the number of questions displayed on screen, and the QuizCard component that's subscribed to this state variable stops the quiz once it passes the last question (in the implementation, the limit is set to 5 questions).

Once the quiz is finished, the user gets redirected to the Leaderboards page/screen, that shows the top 10 scores ever reached (at least, the top 10 stored persistently). In this implementation, negative scores are allowed and registered. A banner with the points made by the user on his attempt is also displayed, that goes away if the user logs out or if the user starts a new game.

# APIs used

The Musixmatch APIs I've chosen to use are:

- [chart.tracks.get](https://developer.musixmatch.com/documentation/api-reference/track-chart-get) , used to retrieve the top tracks for Italy; in the default implementation, for a 5 questions quiz, the tracks fetched are the top 20, in order to give more variety/replayability to the game. Such tracks and the corresponding artists are going to be used as the database for the quiz, storing each group in a separate array (tracks can't be used more than once in each quiz, while the artists, aka the questions' options, can).
- [track.lyrics.get](https://developer.musixmatch.com/documentation/api-reference/track-lyrics-get) , used to fetch the first 30% of the lyrics for each track. The lyrics fetching happens only when a track in the database gets chosen for the current question, instead of fetching them for all tracks in the database at the start, for performance reasons. 
- [track.get](https://developer.musixmatch.com/documentation/api-reference/track-get) , used to re-couple an extracted track in the database with its artist infos, when such track gets indeed extracted to be the question. 


# Dependencies
 
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Libraries used: 

- [react-redux](https://www.npmjs.com/package/react-redux) , (specifically, @reduxjs/toolkit react-redux), for application's global state management.
- [react-router-dom](https://www.npmjs.com/package/react-router-dom) , for application's page/screen routing.
- [redux-persist](https://www.npmjs.com/package/redux-persist) , for persisting redux state into local storage.
- [react-spinners](https://www.npmjs.com/package/react-spinners) , for implementing loading spinners.