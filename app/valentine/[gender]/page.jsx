import React from 'react'
import ValentineCollection from '@/components/ValentineCollection'

const Page = async ({ params }) => {
  const { gender } = await params
  return (
    <ValentineCollection gender={gender} />
  )
}

export default Page
