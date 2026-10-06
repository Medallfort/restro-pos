const MiniCard = ({ title, icon, value, footer, accent = "#f6b100" }) => {
  return (
    <div className='bg-[#1a1a1a] py-5 px-5 rounded-lg w-[50%]'>
        <div className='flex items-start justify-between'>
            <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide'>{title}</h1>
            <button className="p-3 rounded-lg text-[#f5f5f5] text-2xl" style={{ backgroundColor: accent }}>{icon}</button>
        </div>
        <div>
            <h1 className='text-[#f5f5f5] text-4xl font-bold mt-5'>{value}</h1>
            <h1 className='text-[#ababab] text-lg mt-2'>{footer}</h1>
        </div>
    </div>
  )
}

export default MiniCard
