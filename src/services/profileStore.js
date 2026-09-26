const DATABASE_NAME = 'ham-net-checkin-profiles'
const STORE_NAME = 'profiles'

let databasePromise

const openDatabase = () => {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, 1)
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'callsign' })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    }).catch((error) => {
      databasePromise = undefined
      throw error
    })
  }
  return databasePromise
}

const runTransaction = async (mode, work) => {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const store = transaction.objectStore(STORE_NAME)
    let result
    transaction.oncomplete = () => resolve(result)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
    work(store, (value) => { result = value })
  })
}

export const loadStoredProfiles = () => runTransaction('readonly', (store, setResult) => {
  const request = store.getAll()
  request.onsuccess = () => setResult(request.result)
})

export const putStoredProfile = (profile) => runTransaction('readwrite', (store) => {
  store.put(profile)
})

export const replaceStoredProfiles = (profiles) => runTransaction('readwrite', (store) => {
  store.clear()
  profiles.forEach((profile) => store.put(profile))
})
