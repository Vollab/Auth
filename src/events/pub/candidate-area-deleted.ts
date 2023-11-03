import { CandidateAreaDeletedEvent } from 'common/types/events/candidate-area'
import { Publisher } from 'common/services/nats'
import { Subjects } from 'common/types/events'

class CandidateAreaDeletedPub extends Publisher<CandidateAreaDeletedEvent> {
	private static _instance: CandidateAreaDeletedPub = new CandidateAreaDeletedPub()

	readonly subject = Subjects.CandidateAreaDeleted

	static get instance() {
		return this._instance
	}
}

const instance = CandidateAreaDeletedPub.instance
export { instance as candidate_area_deleted_pub }
