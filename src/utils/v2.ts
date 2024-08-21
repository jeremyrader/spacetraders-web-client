import { rateLimiter, burstLimiter } from '../utils/ratelimiter';

export async function fetchResource(endpoint: string) {
  const callsign = window.localStorage.getItem('callsign');

  if (callsign) {
    const token = window.localStorage.getItem(callsign);

    if (token) {
      const options = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(
        `https://api.spacetraders.io/v2/${endpoint}`,
        options,
      );
      const result = await response.json();

      return result;
    } else {
      console.error(`No agent found with callsign ${callsign} `);
    }
  } else {
    console.error('No agent selected');
  }
}

export async function fetchResourcePaginated(
  url: string,
  page: number = 1,
  results: any = [],
): Promise<any> {
  const callsign = window.localStorage.getItem('callsign');

  if (callsign) {
    const token = window.localStorage.getItem(callsign);
    if (token) {
      const options = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const result = await burstLimiter.scheduleRequest(() =>
          rateLimiter.scheduleRequest(() =>
            fetch(
              `https://api.spacetraders.io/v2/${url}?page=${page}`,
              options,
            ).then((res) => res.json()),
          ),
        );

        let concatenated = [...results, ...result.data];

        page++;

        if (result.data.length == result.meta.limit) {
          // Respect rate limiting by introducing a delay if necessary
          await new Promise((resolve) => setTimeout(resolve, 700));
          return await fetchResourcePaginated(url, page, concatenated);
        }
        return concatenated;
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    } else {
      console.error(`No agent found with callsign ${callsign} `);
    }
  } else {
    console.error('No agent selected');
  }
}

export async function postRequest(endpoint: string, body: any = null) {
  const callsign = window.localStorage.getItem('callsign');

  if (callsign) {
    const token = window.localStorage.getItem(callsign);
    if (token) {
      const response = await fetch(
        `https://api.spacetraders.io/v2/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );

      return response;
    } else {
      console.error(`No agent found with callsign ${callsign} `);
    }
  } else {
    console.error('No agent selected');
  }
}
