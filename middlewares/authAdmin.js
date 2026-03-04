import { clerkClient } from "@clerk/nextjs/server";

const authAdmin = async (userId) => {
    if (!userId) {
        console.log("authAdmin: No userId provided");
        return false
    }

    if (!process.env.CLERK_SECRET_KEY) {
        console.error("Error: CLERK_SECRET_KEY is missing from environment variables.");
        return false;
    }

    try {
        const client = await clerkClient()
        const user = await client.users.getUser(userId)

        const adminEmails = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.split(',').map(e => e.trim()) : []
        const userEmail = user.emailAddresses[0]?.emailAddress

        console.log(`authAdmin: Checking user ${userEmail} against admins:`, adminEmails);

        if (!adminEmails.includes(userEmail)) {
            console.log(`authAdmin: User email ${userEmail} is not in admin list.`);
            return false
        }
        return true
    } catch (error) {
        console.error("authAdmin error:", error)
        return false
    }
}
export default authAdmin;