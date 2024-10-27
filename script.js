document.getElementById("startButton").addEventListener("click", () => {
  const authCode = document.getElementById("authCode").value;
  if (!authCode) {
    logMessage("Silakan masukkan kode auth untuk memulai.", "error");
    return;
  }

  startGrowActions(authCode);
});

function logMessage(message, type = "info") {
  const logContainer = document.getElementById("log");
  const logEntry = document.createElement("p");
  logEntry.textContent = message;

  logEntry.style.color = type === "error" ? "red" : "#ffd700";
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

async function startGrowActions(authCode) {
  logMessage("Memulai Grow Action...");

  // Ambil jumlah Grow Actions
  const growActionCount = await getGrowActionCount(authCode);
  if (growActionCount === null) {
    logMessage("Gagal mendapatkan jumlah Grow Action. Periksa auth code Anda.", "error");
    return;
  }
  logMessage(`Jumlah Grow Action Tersedia: ${growActionCount}`);

  // Lakukan spin untuk setiap Grow Action
  for (let i = 1; i <= growActionCount; i++) {
    logMessage(`\n=== Melakukan Spin ${i} dari ${growActionCount} ===`);
    const spinValue = await performSpin(authCode);
    const rewardStatus = await getReward(authCode);
    
    logMessage(`=== Spin ${i} ===`);
    logMessage(`[ASC] Nilai Spin: ${spinValue}`);
    logMessage(`[ASC] Hadiah Berhasil: ${rewardStatus}`);
    
    await delay(2000); // Delay 2 detik
  }

  logMessage("\nTerima kasih telah menggunakan HanaFuda Auto Grow! Dari: Airdrop ASC");
}

async function getGrowActionCount(authCode) {
  try {
    const response = await fetch("https://hanafuda-backend-app-520478841386.us-central1.run.app/graphql", {
      method: "POST",
      headers: getHeaders(authCode),
      body: JSON.stringify({
        query: `query GetGardenForCurrentUser {
                  getGardenForCurrentUser {
                      gardenStatus {
                          growActionCount
                      }
                  }
              }`,
        operationName: "GetGardenForCurrentUser"
      })
    });
    const data = await response.json();
    return data?.data?.getGardenForCurrentUser?.gardenStatus?.growActionCount || null;
  } catch (error) {
    logMessage("Terjadi kesalahan saat mendapatkan Grow Action Count.", "error");
    return null;
  }
}

async function performSpin(authCode) {
  try {
    const response = await fetch("https://hanafuda-backend-app-520478841386.us-central1.run.app/graphql", {
      method: "POST",
      headers: getHeaders(authCode),
      body: JSON.stringify({
        query: "mutation issueGrowAction { issueGrowAction }",
        operationName: "issueGrowAction"
      })
    });
    const data = await response.json();
    return data?.data?.issueGrowAction || null;
  } catch (error) {
    logMessage("Terjadi kesalahan saat melakukan spin.", "error");
    return null;
  }
}

async function getReward(authCode) {
  try {
    const response = await fetch("https://hanafuda-backend-app-520478841386.us-central1.run.app/graphql", {
      method: "POST",
      headers: getHeaders(authCode),
      body: JSON.stringify({
        query: "mutation commitGrowAction { commitGrowAction }",
        operationName: "commitGrowAction"
      })
    });
    const data = await response.json();
    return data?.data?.commitGrowAction || false;
  } catch (error) {
    logMessage("Terjadi kesalahan saat mengambil reward.", "error");
    return false;
  }
}

function getHeaders(authCode) {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${authCode}`,
    "Origin": "https://hanafuda.hana.network",
    "Priority": "u=1, i",
    "Referer": "https://hanafuda.hana.network/",
    "Sec-CH-UA": '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
    "Sec-CH-UA-Mobile": "?0",
    "Sec-CH-UA-Platform": '"Windows"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
    "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 20) + 110}.0.0.0 Safari/537.36`
  };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
