import 'dotenv/config'
import { PrismaClient, AdminRole } from "../generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
const prisma = new PrismaClient({adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })})



async function main() {
  try {
    const testStudent = await prisma.user.upsert({
      where: { enrollmentNumber: '0101AU191002' },
      update: {},
      create: {
        enrollmentNumber: '0101AU191002',
        fullName: 'Ranu Rahandale',
        email: 'mandalsalil75@gmail.com',
        mobile: '9009247906',
        isProfileCompleted: false,
        nickname: null,
        bio: null,
      },
    })

    console.log('Test student created successfully:')
    console.log(`   ID: ${testStudent.id}`)
    console.log(`   Name: ${testStudent.fullName}`)
    console.log(`   Enrollment: ${testStudent.enrollmentNumber}`)
    console.log(`   Email: ${testStudent.email}`)
    console.log(`   Mobile: ${testStudent.mobile}`)

  } catch (error) {
    console.error('Error seeding test student:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
