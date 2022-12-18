const isAdmin = async (req, res, next) => {
  const { Profile } = req.app.get('models')
  const profile = await Profile.findOne({ where: { id: req.get('profile_id') } })

  if (!profile || profile.role !== 'admin') return res.status(401).json({ message: 'Not authorized.' }).end()

  req.profile = profile

  next()
}

module.exports = { isAdmin }
