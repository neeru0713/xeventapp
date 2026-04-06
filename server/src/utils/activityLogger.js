const addActivity = async (user, action, details = '') => {
  user.activityLog.unshift({ action, details })
  user.activityLog = user.activityLog.slice(0, 25)
  await user.save()
}

export default addActivity
