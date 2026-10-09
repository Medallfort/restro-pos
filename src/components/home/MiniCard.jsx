const MiniCard = ({ title, icon, value, footer, accent = "#f6b100" }) => {
  return (
    <div className='bg-[#1a1a1a] py-4 px-4 md:py-5 md:px-5 rounded-lg w-[50%]'>
        <div className='flex items-start justify-between'>
            <h1 className='text-[#f5f5f5] text-sm md:text-lg font-semibold tracking-wide'>{title}</h1>
            <button className="p-3 rounded-lg text-[#f5f5f5] text-2xl" style={{ backgroundColor: accent }}>{icon}</button>
        </div>
        <div>
            <h1 className='text-[#f5f5f5] text-2xl md:text-4xl font-bold mt-3 md:mt-5'>{value}</h1>
            <h1 className='text-[#ababab] text-xs md:text-lg mt-2'>{footer}</h1>
        </div>
    </div>
  )
}

export default MiniCard
