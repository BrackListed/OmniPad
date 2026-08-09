import {Queue, Worker} from "bullmq"

const redisOptions = {host: "localhost", port: 6379}


const testQueue = new Queue("test-queue", {connection: redisOptions})
const testWorker = new Worker(
    "test-queue",
    async(job) => {
        console.log("Worker picked up job id: ", job.id)
        console.log("Job data: ", job.data)
    },
    {connection: redisOptions}
)

testWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`)
    process.exit(0)
})

async function runTest() {
    console.log("Adding job to redis")
    await testQueue.add("first-job", {
        filename: "Hello, World",
        userId: 23
    })
}

runTest()

