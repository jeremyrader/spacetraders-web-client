async function fetchResource(endpoint: string) {
  const callsign = localStorage.getItem('callsign')

  if (callsign) {
    const token = localStorage.getItem(callsign);

    if (token) {
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      };

      const response = await fetch(`https://api.spacetraders.io/v2/${endpoint}`, options)
      const result = await response.json();

      return result
    }
    else {
      console.error(`No agent found with callsign ${callsign} `)
    }

  }
  else {
    console.error('No agent selected')
  }
}

export default fetchResource