import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import Spinner from '../components/LoadingSpinner';

//Component to create a new league
function CreateLeague () {

    const [leagueDetails, setLeagueDetails] = useState({leagueName: '', userId: null})
    const [leagueID, setLeagueID] = useState(null);
    const [creationfailed, setCreationFailed] = useState(false);
    const [leagueFailMessage, setLeagueFailMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const token = sessionStorage.getItem("token");

    const { userDetails, handleExpiredJWT } = useContext(AuthContext);

    //Getting user details immeditaly upon page load
    useEffect(() => {
        if(userDetails.id){
            setLeagueDetails((prevDetails) => ({
                ...prevDetails, userId: userDetails.id
                })
            )
        }
    }, [userDetails])


    const handleChange = (event) => {
        setLeagueDetails((prevDetails) => ({
            ...prevDetails,
            [event.target.name]: event.target.value}))
    }

    //Backend request to create a new league with the "leagueDetails"
    const createNewLeague = async (event) => {
        event.preventDefault();
        setLoading(true);
        console.log('leagueDetails', leagueDetails);
        const backendHost = process.env.REACT_APP_BACKEND_HOST;
        try{
            const response = await fetch(`${backendHost}/leagues/create-league`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(
                    leagueDetails
                )
            });
            
            const data = await response.json();

            //Error handling if backend response is not ok
            if(!response.ok){
                setLeagueFailMessage(data.message)
                setCreationFailed(true);
                throw new Error(data.message);
                
            }
            //setting league ID to display to user if league creation is successful
            else if(response.ok){
                setLeagueID(data.leagueId)
                setCreationFailed(false)
            }
        } catch (error){
        console.log("Error while creating league:", error.message)
        handleExpiredJWT(error);
        }
        setLoading(false);
    }

    return(
        <div className='create-league-container'>
            <form className="create-league-form" onSubmit={createNewLeague}>
                <h3>Create a new League</h3>
                <p>Enter league name and click "Create League" to create a new league</p>
                <input 
                className='create-league-input' 
                placeholder="League Name" 
                name="leagueName" onChange={handleChange} 
                type="text" 
                //Ensuring that the first letter of every word in the league name is capitalized
                value={leagueDetails.leagueName
                        .split(' ')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}>
                </input>
                <button className='create-league-button'>Create League</button>
                {/* Spinner is the leading effect */}
                {loading ? <Spinner /> : null}
            </form>
            <div>
                {creationfailed ? <div><p className='create-league-failure'>{leagueFailMessage}</p></div> : null}
                {leagueID ? <div><p className='create-league-success'>LEAGUE CREATED! Your unique league ID is: {leagueID}</p></div> : null}
            </div>
        </div>
    )
}


export default CreateLeague;