import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../components/AuthContext';
import Spinner from '../components/LoadingSpinner';
import { findCurrentWeek } from '../Utils/dateFinder';


function Submit(){

    const [submissionDetails, setSubmissionDetails] = useState({
            playerName: '',
            score: null,
            players: null,
            userId: null,
            week: "",
            year: new Date().getFullYear()
        });
    
    

    const [submitError, setSubmitError] = useState(false);
    const [errorResponse, setErrorResponse] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [updateScore, setUpdateScore] = useState(false);

    const { userDetails, handleExpiredJWT } = useContext(AuthContext);
    const token = sessionStorage.getItem("token");
    const backendHost = process.env.REACT_APP_BACKEND_HOST;

    //Setting available user details upon load
    useEffect(() => {
        if(userDetails){
            setSubmissionDetails((prevDetails)=> {
                const { name, ...rest} = prevDetails;
                return {
                ...prevDetails,
                userId: userDetails.id, playerName: userDetails.name
                }
            })
        }
    },[userDetails]);
   

    useEffect(() => {
        const period = findCurrentWeek();
        if(period){
        setSubmissionDetails((prevDetails) => ({
            ...prevDetails,
            week: period
        }));
    }
    }, []);

    const handleChange = (event) => {
        setSubmissionDetails((prevDetails) => ({
            ...prevDetails,
            [event.target.name]: Number(event.target.value)
        }));
    }
    //Submitting the score to the backend
    const submitScore = async (event) => {
        event.preventDefault();

        console.log('SUBMISSION DETAILS:', submissionDetails)
        
        try{
            const response = await fetch(`${backendHost}/submission/submit-score`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body:  JSON.stringify(submissionDetails)
                }
            );

            const data = await response.json()

            if(!response.ok){

                if(data.message === "Score already submitted for this week"){
                    setUpdateScore(true)
                    return;
                }

                setSubmitError(true)
                setErrorResponse(data.message)
                throw new Error(data.message)
            } else if(response.ok){
                setErrorResponse(false)
                setResponseMessage(data.message);
                setSubmitSuccess(true);

            }
        } catch(error){
            console.error(error.message);
            handleExpiredJWT(error);
        }
    };

    const handleUpdateScore = async (event) =>{
        event.preventDefault();
        try{
            const updateScore = await fetch(`${backendHost}/submission/update-score`, {
                method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body:  JSON.stringify(submissionDetails)
                })
            
            const data = await updateScore.json()

            if(!updateScore.ok){
                setErrorResponse(data.message)
                setUpdateScore(false);
                return;
            }
            setErrorResponse(false)
            setSubmitSuccess(true)
            setUpdateScore(false)
            setResponseMessage(data.message)
        } catch(error){
            console.error(error.message)
            handleExpiredJWT(error);
        }
    }
    
    return(
        <div className='page-container'>
            <div className='submit-container'>
                <div className="page-heading">
                    <h1 className="page-title">SUBMIT SCORE</h1>
                </div>
                <form className='submit-form' onSubmit={submitScore}>
                    {updateScore ? 
                        <div className='update-score-warning'>
                            <p>Score already submitted for this week. Do you want to update your score?</p>
                            <div className='update-score-button-container'>
                                <button type="button" onClick={handleUpdateScore}>Yes</button>
                                <button type="button" onClick={() => setUpdateScore(false)}>No</button>
                            </div>
                        </div> : null}
                    <p className='submission-week'>Submission for quiz week:<br /> <strong>{findCurrentWeek()}</strong></p>
                    <div className='submit-input-container'>
                        <label className="submit-form-label" htmlFor="score">Score:</label>
                        <input  type="number"
                                min="0" 
                                max="25" 
                                onChange={handleChange}
                                value={submissionDetails.score}
                                id="score"
                                name="score">
                        </input>
                    </div>
                    <div className='submit-input-container'>
                        <label className="submit-form-label" htmlFor='players'>Number of team members:</label>
                        <input  type="number"
                                min="0" 
                                max="25"  
                                value={submissionDetails.players}
                                onChange={handleChange}
                                id="players"
                                name='players'
                                >
                        </input>
                    </div>
                    <div className='button-container'>
                        <button className="score-submit-button" type="submit">Submit</button>
                        {/* Submission response messages */}
                        {submitError ? <p className='error-response'>{errorResponse}</p> : null}
                        {submitSuccess ? <p className='successful-response-message'>{responseMessage}</p> : null}
                        {loading ? <Spinner /> : null}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Submit;