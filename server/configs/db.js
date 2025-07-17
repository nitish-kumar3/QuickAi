import { neon } from '@neondatabase/serverless';

 const sql = neon(`${process.env.DATABASE_URL}`);
 console.log("databse connected",sql)

 export default sql;