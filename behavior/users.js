import bee1 from "../public/bee_1.svg"
import bee2 from "../public/bee_2.svg"
import bee3 from "../public/bee_3.svg"
import hive1 from "../public/hive_1.svg"
import hive2 from "../public/hive_2.svg"
import hive3 from "../public/hive_3.svg"

export const getUserIcons = user => {
  if (user?.isAdmin) {
    return [
      { image: hive1, number: 1 },
      { image: hive2, number: 2 },
      { image: hive3, number: 3 },
    ]
  } else {
    return [
      { image: bee1, number: 1 },
      { image: bee2, number: 2 },
      { image: bee3, number: 3 },
    ]
  }
}

export const getUserIcon = (user) => {
  if (user?.isAdmin) {
    switch(user?.iconNumber) {
    case 1: return hive1
    case 2: return hive2
    case 3: return hive3
    default:
      return hive1
    }
  } else {
    switch(user?.iconNumber) {
    case 1: return bee1
    case 2: return bee2
    case 3: return bee3
    default:
      return bee1
    }
  }
}

export const getUserType = (user) => {
  if (user?.isAdmin) {
    return "admin"
  } else {
    return "user"
  }
}