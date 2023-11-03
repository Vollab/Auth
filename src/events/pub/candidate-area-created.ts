import { CandidateAreaCreatedEvent } from 'common/types/events/candidate-area'
import { Publisher } from 'common/services/nats'
import { Subjects } from 'common/types/events'

class CandidateAreaCreatedPub extends Publisher<CandidateAreaCreatedEvent> {
	private static _instance: CandidateAreaCreatedPub = new CandidateAreaCreatedPub()

	readonly subject = Subjects.CandidateAreaCreated

	static get instance() {
		return this._instance
	}
}

const instance = CandidateAreaCreatedPub.instance
export { instance as candidate_area_created_pub }
