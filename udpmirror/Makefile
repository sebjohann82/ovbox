VERSION=0.1

CXXFLAGS += -Wall -std=c++11 -O3

MPLX=mplx_server mplx_client

BINFILES = $(MPLX)

GITMODIFIED=$(shell test -z "`git status --porcelain -uno`" || echo "-modified")
COMMITHASH=$(shell git log -1 --abbrev=7 --pretty='format:%h')
COMMIT_SINCE_MASTER=$(shell git log --pretty='format:%h' origin/master.. | wc -w)

FULLVERSION=$(VERSION).$(COMMIT_SINCE_MASTER)-$(COMMITHASH)$(GITMODIFIED)

CXXFLAGS += -DOVBOXVERSION="\"$(FULLVERSION)\""

all: $(BINFILES)

common.o: common.cc common.h
udpsocket.o: udpsocket.cc udpsocket.h common.h
callerlist.o: callerlist.cc callerlist.h udpsocket.h common.h

$(DUP): LDLIBS+=-lboost_system -lpthread

$(MPLX): LDLIBS+=-lpthread

$(BINFILES): common.o udpsocket.o callerlist.o

mplx_client: LDLIBS+=-llo

clean:
	rm -f *~ $(BINFILES) *.o
