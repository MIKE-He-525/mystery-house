import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mystery House 评论台',
  description: '把小红书或 Instagram 的评论贴进来，立刻分开购买意向、广告导流，和该回的问题',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
