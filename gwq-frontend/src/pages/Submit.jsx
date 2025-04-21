import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../components/AuthContext';
import Spinner from '../components/LoadingSpinner';
import { parseDate, findCurrentWeek, weeks } from '../Utils/dateFinder';


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

    const { userDetails, handleExpiredJWT } = useContext(AuthContext);
    const token = sessionStorage.getItem("token");

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

    console.log("USER DETAILS", userDetails);
    console.log('Submission Details:', submissionDetails)
   

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
        const backendHost = process.env.REACT_APP_BACKEND_HOST;
        
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
                setSubmitError(true)
                setErrorResponse(data.message)
                throw new Error(data.message)
            } else if(response.ok){
                setErrorResponse(false)
                setResponseMessage(data.message);
                setSubmitSuccess(true);

            }
            console.log(data);
        } catch(error){
            console.error(error.message);
            handleExpiredJWT(error);
            
            
        }
    };
    
    return(
        <div className='page-container'>
            <div className='submit-container'>
                <div className="page-heading">
                    <h1 className="page-title">SUBMIT SCORE</h1>
                </div>
                <form className='submit-form' onSubmit={submitScore}>
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