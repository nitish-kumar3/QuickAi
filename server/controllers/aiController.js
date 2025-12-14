// import OpenAI from "openai";
// import sql from "../configs/db.js";
// import { clerkClient } from "@clerk/express";
// import 'dotenv'
// import axios from "axios";
// import { v2 as cloudinary } from "cloudinary";
// import fs from 'fs'
// import pdf from 'pdf-parse/lib/pdf-parse.js'


// const AI = new OpenAI({
//     apiKey: process.env.GEMINI_API_KEY,
//     baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
// });

// // new helper: exponential backoff with jitter, respects Retry-After
// async function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

// async function callWithBackoff(callFn, args, opts = {}) {
// 	// callFn should be a function that performs the AI call, e.g. () => AI.chat.completions.create({...})
// 	const maxRetries = opts.maxRetries ?? 5;
// 	for (let attempt = 0; attempt <= maxRetries; attempt++) {
// 		try {
// 			const resp = await callFn();
// 			return resp;
// 		} catch (err) {
// 			const status = err?.response?.status || err?.status;
// 			const retryAfterHeader = err?.response?.headers?.['retry-after'] || err?.response?.headers?.['Retry-After'];
// 			// if not a 429 or last attempt -> rethrow
// 			if (status !== 429 && attempt >= maxRetries) throw err;
// 			if (status !== 429 && attempt === maxRetries) throw err;
// 			if (attempt === maxRetries) throw err;
// 			// determine wait: prefer Retry-After if present
// 			let waitMs = 500 * Math.pow(2, attempt); // base exponential
// 			if (retryAfterHeader) {
// 				const ra = parseInt(retryAfterHeader, 10);
// 				if (!Number.isNaN(ra)) waitMs = ra * 1000;
// 			}
// 			// add jitter
// 			waitMs += Math.floor(Math.random() * 300);
// 			console.warn(`AI call 429 or transient error (attempt ${attempt + 1}) — waiting ${waitMs}ms`, { status, retryAfterHeader });
// 			await sleep(waitMs);
// 			// continue retry loop
// 		}
// 	}
// 	throw new Error('Exceeded retries for AI call');
// }

// // helper to safely extract text from various AI SDK responses
// function extractContent(response) {
// 	// common shapes:
// 	// response.choices[0].message.content
// 	// response.output[0].content[0].text
// 	// response.output_text
// 	try {
// 		return response?.choices?.[0]?.message?.content
// 			|| response?.output?.[0]?.content?.[0]?.text
// 			|| response?.output_text
// 			|| response?.data?.choices?.[0]?.message?.content
// 			|| response?.data?.output_text
// 			|| '';
// 	} catch (e) {
// 		return '';
// 	}
// }

// export const generateArticle = async (req, res) => {
//     try {
//         // robust auth extraction
//         let userId = null;
//         try {
//             if (typeof req.auth === 'function') {
//                 const authRes = req.auth();
//                 userId = authRes?.userId || authRes?.user_id || null;
//             } else if (req.auth && typeof req.auth === 'object') {
//                 userId = req.auth.userId || req.auth.user_id || null;
//             }
//         } catch (e) {
//             userId = null;
//         }

//         if (!userId) {
//             return res.status(401).json({ sucess: false, message: "Unauthorized: user missing" });
//         }

//         const { prompt, length } = req.body;
//         if (!prompt || !length) {
//             return res.status(400).json({ sucess: false, message: "Missing prompt or length in request body." });
//         }

//         const plan = req.plan;
//         const free_usage = req.free_usage;

//         if (plan !== 'premium' && free_usage >= 10) {
//             return res.status(403).json({ sucess: false, message: "Limit reached. Upgrade to continue." })
//         }

//         // use wrapper
//         const response = await callWithBackoff(() => AI.chat.completions.create({
//             model: "gemini-2.0-flash",
//             messages: [{ role: "user", content: prompt }],
//             temperature: 0.7,
//             max_tokens: length,
//         }));

//         const content = extractContent(response);

//         await sql` INSERT INTO creation (user_id, prompt, content, type)
//    VALUES (${userId},${prompt},${content}, 'article')`;

//         if (plan !== 'premium') {
//             await clerkClient.users.updateUserMetadata(userId, {
//                 privateMetadata: {
//                     free_usage: free_usage + 1
//                 }
//             })
//         }
//         return res.status(200).json({ sucess: true, content })

//     } catch (error) {
//         // improved logging: full error object and response headers if any
//         console.error('generateArticle error full:', {
//             message: error?.message,
//             stack: error?.stack,
//             error,
//             responseHeaders: error?.response?.headers,
//             responseData: error?.response?.data
//         });
//         return res.status(500).json({ sucess: false, message: error?.message || 'Server error' })
//     }
// }



// export const generateBlogTitle = async (req, res) => {
//     try {
//         // robust auth extraction
//         let userId = null;
//         try {
//             if (typeof req.auth === 'function') {
//                 const authRes = req.auth();
//                 userId = authRes?.userId || authRes?.user_id || null;
//             } else if (req.auth && typeof req.auth === 'object') {
//                 userId = req.auth.userId || req.auth.user_id || null;
//             }
//         } catch (e) {
//             userId = null;
//         }

//         if (!userId) {
//             return res.status(401).json({ sucess: false, message: "Unauthorized: user missing" });
//         }

//         const { prompt } = req.body;
//         if (!prompt) {
//             return res.status(400).json({ sucess: false, message: "Missing prompt in request body." });
//         }

//         const plan = req.plan;
//         const free_usage = req.free_usage;

//         if (plan !== 'premium' && free_usage >= 10) {
//             return res.status(403).json({ sucess: false, message: "Limit reached. Upgrade to continue." })
//         }

//         const response = await callWithBackoff(() => AI.chat.completions.create({
//             model: "gemini-2.0-flash",
//             messages: [{ role: "user", content: prompt }],
//             temperature: 0.7,
//             max_tokens: 100,
//         }));

//         const content = extractContent(response);

//         await sql` INSERT INTO creation (user_id, prompt, content, type)
//    VALUES (${userId},${prompt},${content}, 'blog-article')`;

//         if (plan !== 'premium') {
//             await clerkClient.users.updateUserMetadata(userId, {
//                 privateMetadata: {
//                     free_usage: free_usage + 1
//                 }
//             })
//         }
//         return res.status(200).json({ sucess: true, content })

//     } catch (error) {
//         console.error('generateBlogTitle error full:', {
//             message: error?.message,
//             stack: error?.stack,
//             error,
//             responseHeaders: error?.response?.headers,
//             responseData: error?.response?.data
//         });
//         return res.status(500).json({ sucess: false, message: error?.message || 'Server error' })

//     }
// }


// export const generateImage = async (req, res) => {
//     try {
//         const { userId } = req.auth();
//         const { prompt, publish } = req.body;

//         // if (!prompt || !length) {
//         //     return res.status(400).json({ success: false, message: "Missing prompt or length in request body." });
//         // }

//         const plan = req.plan;

//         if (plan !== 'premium') {
//             return res.json({ sucess: false, message: "This feature is only available for premium sunscriptions." })
//         }

//         const formData = new FormData()
//        formData.append('prompt', prompt)
//        const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1",
//         formData, {
//         headers: {'x-api-key': process.env.CLIPDROP_API_KEY,},
//         responseType: "arraybuffer",
//        })

//        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

//        const {secure_url} = await cloudinary.uploader.upload(base64Image)

//         await sql` INSERT INTO creation (user_id, prompt, content, type, publish)
//         VALUES (${userId},${prompt},${secure_url}, 'image', ${publish ?? false })`;


//         res.json({ sucess: true, content: secure_url})


//     } catch (error) {
//         console.log(error.message)
//         res.json({ sucess: false, message: error.message })

//     }
// }



// export const removeImageBackgroud = async (req, res) => {
//     try {
//         const { userId } = req.auth();
//         const image  = req.file;

//         // if (!prompt || !length) {
//         //     return res.status(400).json({ success: false, message: "Missing prompt or length in request body." });
//         // }
//         const plan = req.plan;

//         if (plan !== 'premium') {
//             return res.json({ sucess: false, message: "This feature is only available for premium sunscriptions." })
//         }


//        const {secure_url} = await cloudinary.uploader.upload(image.path,{
//         transformation: [
//             {
//                 effect: 'background_removal',
//                 background_removal: 'remove_the_background'
//             }
//         ]
//        })

//         await sql` INSERT INTO creation (user_id, prompt, content, type)
//         VALUES (${userId},'Remove background from image',${secure_url}, 'image')`;


//         res.json({ sucess: true, content: secure_url})


//     } catch (error) {
//         console.log(error.message)
//         res.json({ sucess: false, message: error.message })

//     }
// }



// export const removeImageObject = async (req, res) => {
//     try {
//         const { userId } = req.auth();
//         const { object } = req.body;

//         const image  = req.file;

//         // if (!prompt || !length) {
//         //     return res.status(400).json({ success: false, message: "Missing prompt or length in request body." });
//         // }
//         const plan = req.plan;

//         if (plan !== 'premium') {
//             return res.json({ sucess: false, message: "This feature is only available for premium sunscriptions." })
//         }


//        const {public_id} = await cloudinary.uploader.upload(image.path)

//        const imageUrl = cloudinary.url(public_id,{
//         transformation: [{effect: `gen_remove:${object}`}],
//         resource_type: 'image'
//        })

//         await sql` INSERT INTO creation (user_id, prompt, content, type)
//         VALUES (${userId},${`Removed ${object} from image`},${imageUrl}, 'image')`;


//         res.json({ sucess: true, content: imageUrl})


//     } catch (error) {
//         console.log(error.message)
//         res.json({ sucess: false, message: error.message })

//     }
// }

// export const resumeReview = async (req, res) => {
//     try {
//         // robust auth extraction
//         let userId = null;
//         try {
//             if (typeof req.auth === 'function') {
//                 const authRes = req.auth();
//                 userId = authRes?.userId || authRes?.user_id || null;
//             } else if (req.auth && typeof req.auth === 'object') {
//                 userId = req.auth.userId || req.auth.user_id || null;
//             }
//         } catch (e) {
//             userId = null;
//         }

//         if (!userId) {
//             return res.status(401).json({ sucess: false, message: "Unauthorized: user missing" });
//         }

//         const resume = req.file;
//         if (!resume) {
//             return res.status(400).json({ sucess: false, message: "Resume file missing in request." })
//         }

//         const plan = req.plan;

//         if (plan !== 'premium') {
//             return res.status(403).json({ sucess: false, message: "This feature is only available for premium subscriptions." })
//         }

//         if(resume.size > 5 * 1024 *1024){
//             return res.status(400).json({success:false, message: "Resume file size exceeds allowed size (5MB)."})
//         }

//         const dataBuffer = fs.readFileSync(resume.path)
//         const pdfData = await pdf(dataBuffer)

//         const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`

//         const response = await callWithBackoff(() => AI.chat.completions.create({
//             model: "gemini-2.0-flash",
//             messages: [{ role: "user", content: prompt }],
//             temperature: 0.7,
//             max_tokens: 1000,
//         }));

//         const content = extractContent(response);

//         await sql` INSERT INTO creation (user_id, prompt, content, type)
//         VALUES (${userId},'Review the uploaded resume.',${content}, 'resume-review')`;

//         return res.status(200).json({ sucess: true, content})

//     } catch (error) {
//         console.error('resumeReview error full:', {
//             message: error?.message,
//             stack: error?.stack,
//             error,
//             responseHeaders: error?.response?.headers,
//             responseData: error?.response?.data
//         });
//         return res.status(500).json({ sucess: false, message: error?.message || 'Server error' })

//     }
// }


import Groq from "groq-sdk";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import 'dotenv/config';
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Universal text generator (new FREE model)
async function generateText(prompt) {
    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",    // NEW FREE MODEL ✔
        messages: [
            { role: "system", content: "You are a helpful AI assistant." },
            { role: "user", content: prompt }
        ],
        temperature: 0.7
    });

    return response.choices[0].message.content;
}

/* -------------------------------------------------------
    1. GENERATE ARTICLE
--------------------------------------------------------- */
export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        if (!userId) return res.status(401).json({ success: false });

        const { prompt, length } = req.body;
        if (!prompt || !length)
            return res.status(400).json({ success: false, message: "Missing fields" });

        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== "premium" && free_usage >= 10)
            return res.status(403).json({ success: false, message: "Limit reached" });

        const finalPrompt = `${prompt}\nWrite a full SEO-friendly article in ${length} words.`;

        const content = await generateText(finalPrompt);

        await sql`
            INSERT INTO creation (user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${content}, 'article')
        `;

        if (plan !== "premium") {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            });
        }

        return res.status(200).json({ success: true, content });

    } catch (err) {
        console.log("generateArticle Error:", err);
        return res.status(500).json({ success: false });
    }
};

/* -------------------------------------------------------
    2. GENERATE BLOG TITLES
--------------------------------------------------------- */
export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        if (!userId) return res.status(401).json({ success: false });

        const { prompt } = req.body;
        if (!prompt)
            return res.status(400).json({ success: false, message: "Prompt required" });

        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== "premium" && free_usage >= 10)
            return res.status(403).json({ success: false, message: "Limit reached" });

        const finalPrompt = `Generate 10 SEO-friendly blog titles for: ${prompt}`;

        const content = await generateText(finalPrompt);

        await sql`
            INSERT INTO creation (user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
        `;

        if (plan !== "premium") {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            });
        }

        return res.status(200).json({ success: true, content });

    } catch (err) {
        console.error("generateBlogTitle Error:", err);
        return res.status(500).json({ success: false });
    }
};

/* -------------------------------------------------------
    3. RESUME REVIEW
--------------------------------------------------------- */
export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        if (!userId) return res.status(401).json({ success: false });

        const resume = req.file;
        if (!resume)
            return res.status(400).json({ success: false, message: "No file" });

        const buffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(buffer);

        const prompt = `
            Review this resume and provide detailed improvement suggestions:
            ${pdfData.text}
        `;

        const content = await generateText(prompt);

        await sql`
            INSERT INTO creation (user_id, prompt, content, type)
            VALUES (${userId}, 'Resume Review', ${content}, 'resume-review')
        `;

        return res.status(200).json({ success: true, content });

    } catch (err) {
        console.error("ResumeReview Error:", err);
        return res.status(500).json({ success: false });
    }
};


/* -------------------------------------------------------
    (Your image generation & removal code stays SAME)
--------------------------------------------------------- */

export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, publish } = req.body;

        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ sucess: false, message: "This feature is only available for premium sunscriptions." })
        }

        const formData = new FormData()
        formData.append('prompt', prompt)

        const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1",
            formData, {
            headers: { 'x-api-key': process.env.CLIPDROP_API_KEY, },
            responseType: "arraybuffer",
        })

        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

        const { secure_url } = await cloudinary.uploader.upload(base64Image);

        await sql`
            INSERT INTO creation (user_id, prompt, content, type, publish)
            VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
        `;

        return res.json({ success: true, content: secure_url })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
};


export const removeImageBackgroud = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;

        // if (!prompt || !length) {
        //     return res.status(400).json({ success: false, message: "Missing prompt or length in request body." });
        // }
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ sucess: false, message: "This feature is only available for premium sunscriptions." })
        }


        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
        })

        await sql` INSERT INTO creation (user_id, prompt, content, type)
        VALUES (${userId},'Remove background from image',${secure_url}, 'image')`;


        res.json({ success: true, content: secure_url })


    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })

    }
}



export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { object } = req.body;

        const image = req.file;

        // if (!prompt || !length) {
        //     return res.status(400).json({ success: false, message: "Missing prompt or length in request body." });
        // }
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium sunscriptions." })
        }


        const { public_id } = await cloudinary.uploader.upload(image.path)

        const imageUrl = cloudinary.url(public_id, {
            transformation: [{ effect: `gen_remove:${object}` }],
            resource_type: 'image'
        })

        await sql` INSERT INTO creation (user_id, prompt, content, type)
        VALUES (${userId},${`Removed ${object} from image`},${imageUrl}, 'image')`;


        res.json({ success: true, content: imageUrl })


    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })

    }
}