  (func (;43403;) (type 52) (param i32 i32 f32 i32 i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 5
    global.set 0
    i32.const 4366745
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3377868
      call 2180
      i32.const 3377872
      call 2180
      i32.const 3408360
      call 2180
      i32.const 3413540
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3362128
      call 2180
      i32.const 3415768
      call 2180
      i32.const 4366745
      i32.const 1
      i32.store8
    end
    local.get 5
    i32.const 0
    i32.store offset=8
    i32.const 3362128
    i32.load
    local.tee 4
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 4
      call 60460
    end
    block  ;; label = @1
      block  ;; label = @2
        i32.const 0
        call 43634
        i32.load offset=44
        local.get 1
        i32.load offset=20
        local.get 5
        i32.const 8
        i32.add
        i32.const 3377868
        i32.load
        call 34286
        if  ;; label = @3
          local.get 5
          i32.load offset=8
          local.set 4
          i32.const 3360788
          i32.load
          local.tee 6
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 6
            call 60460
          end
          local.get 4
          i32.const 0
          i32.const 0
          call 48872
          i32.eqz
          br_if 1 (;@2;)
        end
        local.get 5
        i32.const 0
        call 56067
        i32.load offset=260
        local.get 1
        i32.load offset=20
        i32.const 0
        call 48049
        i32.const 3415768
        i32.load
        call 24700
        local.tee 4
        i32.store offset=8
        i32.const 3360788
        i32.load
        local.tee 6
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 6
          call 60460
        end
        local.get 4
        i32.const 0
        i32.const 0
        call 48872
        if  ;; label = @3
          local.get 3
          i32.eqz
          br_if 2 (;@1;)
          local.get 3
          i32.load offset=32
          local.get 3
          i32.load offset=20
          local.get 3
          i32.load offset=12
          call_indirect (type 1)
          br 2 (;@1;)
        end
        i32.const 3362128
        i32.load
        local.tee 4
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 4
          call 60460
        end
        i32.const 0
        call 43634
        i32.load offset=44
        local.get 1
        i32.load offset=20
        local.get 5
        i32.load offset=8
        i32.const 3377872
        i32.load
        call 34436
      end
      local.get 0
      i32.load offset=16
      local.set 4
      local.get 5
      i32.load offset=8
      local.set 6
      i32.const 3360788
      i32.load
      local.tee 7
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 7
        call 60460
      end
      local.get 0
      local.get 6
      local.get 4
      i32.const 3413540
      i32.load
      call 24532
      local.tee 4
      i32.store offset=60
      local.get 4
      local.get 5
      i32.const 12
      i32.add
      i32.const 3408360
      i32.load
      call 45354
      local.get 0
      local.get 5
      i32.load offset=12
      local.tee 4
      i32.store offset=64
      local.get 4
      if  ;; label = @2
        local.get 4
        local.get 0
        i32.load offset=84
        local.get 1
        i32.const 0
        call 43244
      end
      local.get 0
      i32.load offset=32
      local.set 1
      i32.const 3360788
      i32.load
      local.tee 4
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 4
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
      local.get 0
      local.get 2
      local.get 3
      local.get 5
      call 43441
    end
    local.get 5
    i32.const 16
    i32.add
    global.set 0)
