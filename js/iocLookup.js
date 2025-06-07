// iocLookup.js

document.addEventListener('DOMContentLoaded', () => {
    const iocInput = document.getElementById('iocInput');
    const analyzeIocBtn = document.getElementById('analyzeIocBtn');
    const iocResultsDiv = document.getElementById('iocResults');
    const exportIocHtmlBtn = document.getElementById('exportIocHtmlBtn');
    const exportIocPdfBtn = document.getElementById('exportIocPdfBtn');

    // Store ongoing API requests to prevent race conditions or double clicks
    let activeApiRequests = 0;

    analyzeIocBtn.addEventListener('click', async () => {
        const iocs = iocInput.value.split('\n')
                                   .map(line => line.trim())
                                   .filter(line => line !== '');

        if (iocs.length === 0) {
            alert('Please enter at least one IOC.');
            return;
        }

        // Disable button and show loading indicator
        analyzeIocBtn.disabled = true;
        analyzeIocBtn.textContent = 'Analyzing...';
        iocResultsDiv.innerHTML = '<p class="status-message">Analyzing IOCs, please wait...</p>';

        const apiKeys = window.getApiKeys(); // Get API keys from global function in script.js
        const abuseIpDbKey = apiKeys.abuseIpDb;
        const greyNoiseKey = apiKeys.greyNoise;

        const results = [];
        activeApiRequests = 0; // Reset active requests counter

        for (const ioc of iocs) {
            const type = detectIocType(ioc);
            let reputation = 'N/A';
            let location = 'N/A';
            let risk = 'N/A';
            let verdict = 'N/A';
            let specificDetails = ''; // For additional info like GreyNoise context

            activeApiRequests++; // Increment for each potential API call chain

            // Process based on IOC type
            if (type === 'IPv4' || type === 'IPv6') {
                // AbuseIPDB (IP Reputation)
                if (abuseIpDbKey) {
                    try {
                        const abuseIpDbData = await fetchAbuseIpDb(ioc, abuseIpDbKey);
                        if (abuseIpDbData && abuseIpDbData.data) {
                            reputation = `${abuseIpDbData.data.abuseConfidenceScore || 0}% Confidence`;
                            verdict = abuseIpDbData.data.isWhitelisted ? 'Whitelisted' : (abuseIpDbData.data.abuseConfidenceScore > 50 ? 'Malicious' : 'Clean');
                            specificDetails += `Abuse: ${abuseIpDbData.data.totalReports} reports. `;
                        }
                    } catch (error) {
                        console.error(`Error fetching AbuseIPDB for ${ioc}:`, error);
                        reputation = 'AbuseIPDB Error';
                    }
                } else {
                    reputation = 'AbuseIPDB API Key Missing';
                }

                // IP Geolocation (ipapi.co)
                try {
                    const geoData = await fetchIpGeolocation(ioc);
                    if (geoData) {
                        location = `${geoData.city || 'N/A'}, ${geoData.country_name || 'N/A'}`;
                    }
                } catch (error) {
                    console.error(`Error fetching geolocation for ${ioc}:`, error);
                    location = 'Geolocation Error';
                }

                // GreyNoise (IP Scanner Context)
                if (greyNoiseKey) {
                    try {
                        const greyNoiseData = await fetchGreyNoise(ioc, greyNoiseKey);
                        if (greyNoiseData && greyNoiseData.noise) {
                            risk = greyNoiseData.classification; // benign, malicious, unknown
                            verdict = greyNoiseData.noise ? 'Scanner/Noise' : verdict; // Override if it's noise
                            specificDetails += `GreyNoise: ${greyNoiseData.name || 'N/A'} - ${greyNoiseData.tags.join(', ') || 'None'}`;
                        } else if (greyNoiseData && greyNoiseData.error) {
                             specificDetails += `GreyNoise: ${greyNoiseData.error}. `;
                        }
                    } catch (error) {
                        console.error(`Error fetching GreyNoise for ${ioc}:`, error);
                        specificDetails += `GreyNoise: API Error. `;
                    }
                } else {
                    specificDetails += 'GreyNoise API Key Missing. ';
                }

            } else if (type === 'Domain') {
                // For domains, you might integrate with VirusTotal or similar,
                // but for a frontend-only app without direct VT domain lookup,
                // we'll keep it simple or note it as "needs more APIs".
                reputation = 'N/A (Domain APIs needed)';
                location = 'N/A'; // No direct geo for domain, maybe resolve IP first
                risk = 'N/A';
                verdict = 'Analyze Manually';
            } else if (type === 'Hash') {
                // For hashes, VirusTotal is common, but again, direct browser fetch
                // from VT for hashes without a backend or CORS proxy is tricky.
                // We'll mark it as needing external lookup.
                reputation = 'N/A (Hash APIs needed)';
                location = 'N/A';
                risk = 'N/A';
                verdict = 'External Lookup Recommended';
            } else {
                reputation = 'Unknown Type';
                verdict = 'N/A';
            }

            results.push({
                ioc: ioc,
                type: type,
                reputation: reputation,
                location: location,
                risk: risk,
                verdict: verdict,
                details: specificDetails // Add a column for specific details
            });
            activeApiRequests--; // Decrement after all API calls for this IOC are done

            // Render results iteratively to show progress, especially for many IOCs
            renderIocResults(results);
        }

        // Final check, ensure all promises have resolved before enabling button
        // This is a simplified approach, a Promise.allSettled might be better for many concurrent calls
        // but here we are awaiting each IOC sequentially.
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to ensure last results are processed.
        analyzeIocBtn.disabled = false;
        analyzeIocBtn.textContent = 'Analyze IOCs';
    });

    // --- Helper Functions ---

    function detectIocType(ioc) {
        // Simple regex for detection. Can be improved.
        if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ioc)) return 'IPv4';
        if (/^[0-9a-fA-F:]{3,39}$/.test(ioc) && ioc.includes(':')) return 'IPv6'; // Basic IPv6, not exhaustive
        if (/^[a-fA-F0-9]{64}$/.test(ioc)) return 'SHA256';
        if (/^[a-fA-F0-9]{40}$/.test(ioc)) return 'SHA1';
        if (/^[a-fA-F0-9]{32}$/.test(ioc)) return 'MD5';
        if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(ioc)) return 'Domain';
        return 'Unknown';
    }

    async function fetchAbuseIpDb(ip, apiKey) {
        // CORS proxy is essential for most direct API calls from frontend.
        // For a frontend-only app, you'd typically need to use a public CORS proxy
        // or instruct users to set one up, or rely on APIs that support CORS.
        // AbuseIPDB does support CORS if configured.
        const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`;
        const headers = {
            'Key': apiKey,
            'Accept': 'application/json'
        };

        try {
            const response = await fetch(url, { headers: headers });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`AbuseIPDB API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            return await response.json();
        } catch (error) {
            console.error('AbuseIPDB Fetch Error:', error);
            throw error; // Re-throw to be caught by caller
        }
    }

    async function fetchIpGeolocation(ip) {
        // ipapi.co supports CORS. Free tier has rate limits (1000 requests/day, 30/min for /json/).
        const url = `https://ipapi.co/${ip}/json/`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Geolocation API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            const data = await response.json();
            if (data.error) { // ipapi.co sends error in body for some errors
                throw new Error(`Geolocation API error: ${data.reason}`);
            }
            return data;
        } catch (error) {
            console.error('IP Geolocation Fetch Error:', error);
            throw error;
        }
    }

    async function fetchGreyNoise(ip, apiKey) {
        // GreyNoise Community API supports CORS.
        const url = `https://api.greynoise.io/v3/community/${ip}`;
        const headers = {
            'key': apiKey,
            'Accept': 'application/json'
        };
        try {
            const response = await fetch(url, { headers: headers });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GreyNoise API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            return await response.json();
        } catch (error) {
            console.error('GreyNoise Fetch Error:', error);
            throw error;
        }
    }


    function renderIocResults(results) {
        if (results.length === 0) {
            iocResultsDiv.innerHTML = '<p class="status-message">No results to display.</p>';
            return;
        }

        let tableHtml = `
            <table class="results-table">
                <thead>
                    <tr>
                        <th>IOC</th>
                        <th>Type</th>
                        <th>Reputation</th>
                        <th>Location</th>
                        <th>Risk</th>
                        <th>Verdict</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
        `;
        results.forEach(row => {
            tableHtml += `
                <tr>
                    <td>${row.ioc}</td>
                    <td>${row.type}</td>
                    <td>${row.reputation}</td>
                    <td>${row.location}</td>
                    <td>${row.risk}</td>
                    <td>${row.verdict}</td>
                    <td><small>${row.details}</small></td>
                </tr>
            `;
        });
        tableHtml += `
                </tbody>
            </table>
        `;
        iocResultsDiv.innerHTML = tableHtml;

        // Enable export buttons once results are rendered
        exportIocHtmlBtn.disabled = false;
        exportIocPdfBtn.disabled = false;
    }

    // --- Report Generation Integration (Delegated to reportGenerator.js) ---
    exportIocHtmlBtn.addEventListener('click', () => {
        const table = iocResultsDiv.querySelector('.results-table');
        if (table && window.generateHtmlReport) {
            window.generateHtmlReport('IOC Lookup Report', table.outerHTML);
        } else {
            alert('No IOC results table to export or report generator not loaded.');
        }
    });

    exportIocPdfBtn.addEventListener('click', () => {
        const table = iocResultsDiv.querySelector('.results-table');
        if (table && window.generatePdfReport) {
            const data = Array.from(table.rows).map(row => Array.from(row.cells).map(cell => cell.innerText));
            // First row is headers, so extract separately
            const headers = data.shift();
            window.generatePdfReport('IOC Lookup Report', headers, data);
        } else {
            alert('No IOC results table to export or report generator not loaded.');
        }
    });

    // Initial state: disable export buttons
    exportIocHtmlBtn.disabled = true;
    exportIocPdfBtn.disabled = true;
});