import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
  }
}>()

// middleware
app.use('/api/v1/blog/*', async (c, next) => {
  // get the header
  // verify the header
  // if the header is correct, we need to proceed
  // if not, return 403 status code

  const header = c.req.header("authorization") || "";

  // @ts-ignore
  const response = await verify(header, c.env.JWT_SECRET)
  if (response.id) {
    next()
  } else {
    c.status(403)
    return c.json({ error: "unauthorized"})
  }
})

//Signup 
app.post('/api/v1/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json();

  await prisma.user.create({
    data: {
      email: body.email,
      password: body.password,
    },
  })

  //@ts-ignore
  const token = await sign({ id: user.id }, c.env.JWT_SECRET)

  return c.json({
    jwt: token
  })
})


//Signin
app.post('/api/v1/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL ,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password
    }
  });
  
  if (!user) {
    c.status(403);
    return c.json({ error: "user not found" });
  }

  //@ts-ignore
  const jwt = await sign({ id: user.id}, c.env.JWT_SECRET); 
  return c.json({ jwt });
})


app.post('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})


app.put('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})


app.get('/api/v1/blog/:id', (c) => {
  return c.text('Hello Hono!')
})

export default app
