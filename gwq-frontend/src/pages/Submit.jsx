import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../components/AuthContext';
import Spinner from '../components/LoadingSpinner';


function Submit(){

    const [submissionDetails, setSubmissionDetails] = useState({
            playerName: '',
            score: null,
            players: null,
            userId: null,
            week: "",
            year: new Date().getFullYear()
        });
    
    //Variable containing all week periods of the year for score submissions
    const weeks = [
        "Sat Jan 04 2025 - Fri Jan 10 2025",
        "Sat Jan 11 2025 - Fri Jan 17 2025",
        "Sat Jan 18 2025 - Fri Jan 24 2025",
        "Sat Jan 25 2025 - Fri Jan 31 2025",
        "Sat Feb 01 2025 - Fri Feb 07 2025",
        "Sat Feb 08 2025 - Fri Feb 14 2025",
        "Sat Feb 15 2025 - Fri Feb 21 2025",
        "Sat Feb 22 2025 - Fri Feb 28 2025",
        "Sat Mar 01 2025 - Fri Mar 07 2025",
        "Sat Mar 08 2025 - Fri Mar 14 2025",
        "Sat Mar 15 2025 - Fri Mar 21 2025",
        "Sat Mar 22 2025 - Fri Mar 28 2025",
        "Sat Mar 29 2025 - Fri Apr 04 2025",
        "Sat Apr 05 2025 - Fri Apr 11 2025",
        "Sat Apr 12 2025 - Fri Apr 18 2025",
        "Sat Apr 19 2025 - Fri Apr 25 2025",
        "Sat Apr 26 2025 - Fri May 02 2025",
        "Sat May 03 2025 - Fri May 09 2025",
        "Sat May 10 2025 - Fri May 16 2025",
        "Sat May 17 2025 - Fri May 23 2025",
        "Sat May 24 2025 - Fri May 30 2025",
        "Sat May 31 2025 - Fri Jun 06 2025",
        "Sat Jun 07 2025 - Fri Jun 13 2025",
        "Sat Jun 14 2025 - Fri Jun 20 2025",
        "Sat Jun 21 2025 - Fri Jun 27 2025",
        "Sat Jun 28 2025 - Fri Jul 04 2025",
        "Sat Jul 05 2025 - Fri Jul 11 2025",
        "Sat Jul 12 2025 - Fri Jul 18 2025",
        "Sat Jul 19 2025 - Fri Jul 25 2025",
        "Sat Jul 26 2025 - Fri Aug 01 2025",
        "Sat Aug 02 2025 - Fri Aug 08 2025",
        "Sat Aug 09 2025 - Fri Aug 15 2025",
        "Sat Aug 16 2025 - Fri Aug 22 2025",
        "Sat Aug 23 2025 - Fri Aug 29 2025",
        "Sat Aug 30 2025 - Fri Sep 05 2025",
        "Sat Sep 06 2025 - Fri Sep 12 2025",
        "Sat Sep 13 2025 - Fri Sep 19 2025",
        "Sat Sep 20 2025 - Fri Sep 26 2025",
        "Sat Sep 27 2025 - Fri Oct 03 2025",
        "Sat Oct 04 2025 - Fri Oct 10 2025",
        "Sat Oct 11 2025 - Fri Oct 17 2025",
        "Sat Oct 18 2025 - Fri Oct 24 2025",
        "Sat Oct 25 2025 - Fri Oct 31 2025",
        "Sat Nov 01 2025 - Fri Nov 07 2025",
        "Sat Nov 08 2025 - Fri Nov 14 2025",
        "Sat Nov 15 2025 - Fri Nov 21 2025",
        "Sat Nov 22 2025 - Fri Nov 28 2025",
        "Sat Nov 29 2025 - Fri Dec 05 2025",
        "Sat Dec 06 2025 - Fri Dec 12 2025",
        "Sat Dec 13 2025 - Fri Dec 19 2025",
        "Sat Dec 20 2025 - Fri Dec 26 2025",
        "Sat Dec 27 2025 - Fri Jan 02 2026"
      ];

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
    //Function for formatting date strings
    const parseDate = (dateString) => {
        return new Date(dateString);
    }

    //Function to find the current week from the "weeks' array
    const findCurrentWeek = () => {
        const currentDate = new Date();
        for (let week of weeks){
            //Splitting each period into a start and end date
            const [startDateString, endDateString] = week.split(' - ');

            //Formatting the dates for comparison
            const startDate = parseDate(startDateString);
            const endDate = parseDate(endDateString);
            //Ensuring the end date includes the whole day eg the week starts at midnight on saturday and ends at 23:59:59 on friday
            endDate.setHours(23, 59, 59, 999)

            //Finding and returning the week which meets the criteria
            if (currentDate >= startDate && currentDate <= endDate){
                return week;
            }
        }
    }

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