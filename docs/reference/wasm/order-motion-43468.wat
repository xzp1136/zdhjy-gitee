  (func (;43468;) (type 1) (param i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 32
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4366768
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3403152
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3364328
      call 2180
      i32.const 4366768
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load8_u offset=128
      br_if 0 (;@1;)
      local.get 0
      i32.const 1
      i32.store8 offset=76
      local.get 0
      i32.const 1
      i32.store8 offset=128
      local.get 0
      i32.load offset=40
      i32.const 0
      call 48736
      i32.const 0
      i32.const 0
      call 48833
      local.get 0
      i32.load offset=32
      local.set 1
      i32.const 3360788
      i32.load
      local.tee 3
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 3
        call 60460
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 48812
      if  ;; label = @2
        local.get 0
        i32.load offset=32
        i32.const 0
        i32.const 0
        call 48833
      end
      i32.const 4367477
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360984
        call 2180
        i32.const 4367477
        i32.const 1
        i32.store8
      end
      block  ;; label = @2
        i32.const 3360984
        i32.load
        i32.load offset=92
        i32.load
        local.tee 1
        i32.eqz
        br_if 0 (;@2;)
        local.get 1
        local.get 0
        call 43424
        i32.const 4367477
        i32.load8_u
        br_if 0 (;@2;)
        i32.const 3360984
        call 2180
        i32.const 4367477
        i32.const 1
        i32.store8
      end
      i32.const 3360984
      i32.load
      i32.load offset=92
      i32.load
      local.tee 1
      if  ;; label = @2
        local.get 1
        local.get 0
        call 43426
      end
      local.get 0
      local.get 0
      call 43447
      i32.const 3364328
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      i32.const 4367475
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364328
        call 2180
        i32.const 4367475
        i32.const 1
        i32.store8
      end
      i32.const 3364328
      i32.load
      local.tee 1
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 1
      else
        local.get 1
        call 60460
        i32.const 3364328
        i32.load
      end
      i32.load offset=92
      i32.load
      local.set 1
      i32.const 3360788
      i32.load
      local.tee 3
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 3
        call 60460
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 48812
      i32.eqz
      br_if 0 (;@1;)
      i32.const 3364328
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      i32.const 4367475
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364328
        call 2180
        i32.const 4367475
        i32.const 1
        i32.store8
      end
      i32.const 3364328
      i32.load
      local.tee 1
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 1
      else
        local.get 1
        call 60460
        i32.const 3364328
        i32.load
      end
      i32.load offset=92
      i32.load
      i32.load offset=24
      local.set 1
      i32.const 3360788
      i32.load
      local.tee 3
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 3
        call 60460
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 48812
      i32.eqz
      br_if 0 (;@1;)
      i32.const 3364328
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      i32.const 4367475
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364328
        call 2180
        i32.const 4367475
        i32.const 1
        i32.store8
      end
      i32.const 3364328
      i32.load
      local.tee 1
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 1
      else
        local.get 1
        call 60460
        i32.const 3364328
        i32.load
      end
      i32.load offset=92
      i32.load
      i32.load offset=24
      local.set 1
      local.get 0
      i32.const 0
      call 48735
      local.get 2
      i32.const 16
      i32.add
      i32.const 3403152
      i32.load
      call 45307
      local.get 2
      i32.const 16
      i32.add
      local.get 2
      i32.load offset=16
      i32.const 0
      call 49468
      local.get 2
      local.get 2
      i32.load offset=24
      i32.store offset=8
      local.get 2
      local.get 2
      i64.load offset=16
      i64.store
      local.get 1
      local.get 2
      i32.const 0
      call 42711
    end
    local.get 2
    i32.const 32
    i32.add
    global.set 0)
