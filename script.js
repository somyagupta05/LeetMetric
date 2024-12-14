document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("search-btn");
  const usernameInput = document.getElementById("user-input");
  const statsContainer = document.querySelector(".stats-container");
  const easyProgressCircle = document.querySelector(".easy-progress");
  const mediumProgressCircle = document.querySelector(".medium-progress");
  const hardProgressCircle = document.querySelector(".hard-progress");
  const easyLabel = document.getElementById("easy-label");
  const mediumLabel = document.getElementById("medium-label");
  const hardLabel = document.getElementById("hard-label");
  const cardStatsContainer = document.querySelector(".stats-cards");

  //return true or false based on a regex
  function validateUsername(username) {
    if (username.trim() === "") {
      alert("Username should not be empty");
      return false;
    }
    const regex = /^[a-zA-Z0-9_-]{1,15}$/;
    const isMatching = regex.test(username);
    if (!isMatching) {
      alert("Invalid Username");
    }
    return isMatching;
  }

  async function fetchUserDetails(username) {
    try {
      searchButton.textContent = "Searching...";
      searchButton.disabled = true;

      const targetUrl = "http://localhost:5000/graphql"; // Update to your local proxy

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const graphql = JSON.stringify({
        query: `
                query userSessionProgress($username: String!) {
                    allQuestionsCount {
                        difficulty
                        count
                    }
                    matchedUser(username: $username) {
                        submitStats {
                            acSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                            totalSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                        }
                    }
                }
            `,
        variables: { username: username },
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
      };

      const response = await fetch(targetUrl, requestOptions);
      if (!response.ok) {
        throw new Error("Unable to fetch the User details");
      }

      const parsedData = await response.json();
      console.log("Logging data: ", parsedData);

      displayUserData(parsedData);
    } catch (error) {
      statsContainer.innerHTML = `<p>${error.message}</p>`;
    } finally {
      searchButton.textContent = "Search";
      searchButton.disabled = false;
    }
  }

  function updateProgress(solved, total, label, circle) {
    const progressDegree = (solved / total) * 100;
    circle.style.setProperty("--progress-degree", `${progressDegree}%`);
    label.textContent = `${solved}/${total}`;
  }

  function displayUserData(parsedData) {
    if (!parsedData.data) {
      throw new Error("No data returned from API");
    }

    const allQuestionsCount = parsedData.data.allQuestionsCount;
    if (!allQuestionsCount || allQuestionsCount.length < 4) {
      throw new Error("Unexpected data structure for allQuestionsCount");
    }

    const totalQues = allQuestionsCount[0].count;
    const totalEasyQues = allQuestionsCount[1].count;
    const totalMediumQues = allQuestionsCount[2].count;
    const totalHardQues = allQuestionsCount[3].count;

    const solvedStats =
      parsedData.data.matchedUser?.submitStats?.acSubmissionNum;
    if (!solvedStats || solvedStats.length < 4) {
      throw new Error("Unexpected data structure for solved stats");
    }

    const solvedTotalQues = solvedStats[0].count;
    const solvedTotalEasyQues = solvedStats[1].count;
    const solvedTotalMediumQues = solvedStats[2].count;
    const solvedTotalHardQues = solvedStats[3].count;

    updateProgress(
      solvedTotalEasyQues,
      totalEasyQues,
      easyLabel,
      easyProgressCircle
    );
    updateProgress(
      solvedTotalMediumQues,
      totalMediumQues,
      mediumLabel,
      mediumProgressCircle
    );
    updateProgress(
      solvedTotalHardQues,
      totalHardQues,
      hardLabel,
      hardProgressCircle
    );

    const cardsData = [
      {
        label: "Overall Submissions",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[0]
            .submissions,
      },
      {
        label: "Overall Easy Submissions",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[1]
            .submissions,
      },
      {
        label: "Overall Medium Submissions",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[2]
            .submissions,
      },
      {
        label: "Overall Hard Submissions",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[3]
            .submissions,
      },
    ];

    cardStatsContainer.innerHTML = cardsData
      .map(
        (data) =>
          `<div class="card"><h4>${data.label}</h4><p>${data.value}</p></div>`
      )
      .join("");
  }

  searchButton.addEventListener("click", function () {
    const username = usernameInput.value;
    console.log("logggin username: ", username);
    if (validateUsername(username)) {
      fetchUserDetails(username);
    }
  });
});
