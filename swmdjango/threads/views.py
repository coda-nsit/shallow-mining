from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
from collections import defaultdict


class GetThreads(APIView):
    def post(self, request, format=None):
        querySymptom = request.data.get('symptom')

        with open('/Users/rishabbanerjee/Documents/Classwork/CSE 573/swm-backend/dummyData.json') as f:
            symptomsData = json.load(f)
            # return all threads
            if querySymptom is None:
                return Response(symptomsData, status=status.HTTP_200_OK)

            relatedSymptoms = symptomsData["related_symptoms"]
            threads         = defaultdict(list)
            # add the query symptom also
            relatedSymptoms.append(querySymptom)

            for symptom in relatedSymptoms:
                if symptom in symptomsData["threads"]:
                    for data in symptomsData["threads"][symptom]:
                        threads[symptom].append(data)

        data = {
            "related_symptoms": relatedSymptoms,
            "threads": threads
        }
        return Response(data, status=status.HTTP_200_OK)






