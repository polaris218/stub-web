export default function (it) {
  if (isTask(it)) {
    return '/tasks/' + it.entity_id
  }
}

export function isTask(it) {
  return it.entity_type == 'TASK'
}
