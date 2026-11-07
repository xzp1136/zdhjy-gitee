  (func (;44358;) (type 6) (param i32 i32 i32 i32)
    (local i32 i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4367379
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3375632
      call 2180
      i32.const 3357344
      call 2180
      i32.const 3386588
      call 2180
      i32.const 3386592
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3481344
      call 2180
      i32.const 4367379
      i32.const 1
      i32.store8
    end
    local.get 0
    local.get 2
    i32.store offset=84
    local.get 0
    i32.load offset=72
    local.set 6
    local.get 0
    local.get 1
    i32.store offset=72
    i32.const 3357344
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    i32.const 4367474
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3357344
      call 2180
      i32.const 4367474
      i32.const 1
      i32.store8
    end
    i32.const 3357344
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
      i32.const 3357344
      i32.load
      local.set 2
    end
    i32.const 3375632
    i32.load
    local.set 4
    local.get 2
    i32.load offset=92
    i32.load
    i32.load offset=20
    local.set 2
    local.get 3
    local.get 1
    i32.store offset=12
    local.get 2
    local.get 3
    i32.const 12
    i32.add
    local.get 3
    i32.const 8
    i32.add
    local.get 4
    call 34434
    block  ;; label = @1
      local.get 3
      i32.load offset=8
      local.tee 2
      i32.const 0
      call 48864
      local.tee 7
      i32.const 0
      i32.ge_s
      if  ;; label = @2
        local.get 0
        i32.const 0
        call 48736
        local.get 7
        i32.const 0
        call 48830
        local.get 0
        i32.load offset=40
        local.tee 4
        i32.load offset=12
        i32.const 0
        i32.le_s
        br_if 1 (;@1;)
        i32.const 0
        local.set 2
        loop  ;; label = @3
          local.get 4
          local.get 2
          local.get 3
          i32.const 12
          i32.add
          i32.const 3386592
          i32.load
          call 50458
          local.get 3
          i32.load offset=12
          local.set 4
          i32.const 3360788
          i32.load
          local.tee 5
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 5
            call 60460
          end
          block  ;; label = @4
            local.get 4
            i32.const 0
            i32.const 0
            call 48872
            br_if 0 (;@4;)
            local.get 0
            i32.load offset=40
            local.get 2
            local.get 3
            i32.const 12
            i32.add
            i32.const 3386592
            i32.load
            call 50458
            local.get 3
            i32.load offset=12
            local.set 4
            local.get 0
            i32.load offset=44
            local.set 5
            i32.const 3360788
            i32.load
            local.tee 8
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 8
              call 60460
            end
            local.get 4
            local.get 5
            i32.const 0
            call 48872
            br_if 0 (;@4;)
            local.get 0
            i32.load offset=40
            local.get 2
            local.get 3
            i32.const 12
            i32.add
            i32.const 3386592
            i32.load
            call 50458
            local.get 3
            i32.load offset=12
            i32.const 0
            call 48736
            local.get 7
            i32.const 0
            call 48830
          end
          local.get 2
          i32.const 1
          i32.add
          local.tee 2
          local.get 0
          i32.load offset=40
          local.tee 4
          i32.load offset=12
          i32.lt_s
          br_if 0 (;@3;)
        end
        br 1 (;@1;)
      end
      i32.const 3481344
      i32.load
      local.get 2
      i32.const 0
      call 48049
      local.set 2
      i32.const 3356428
      i32.load
      local.tee 4
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 4
        call 60460
      end
      local.get 2
      i32.const 0
      call 55218
    end
    local.get 0
    local.get 0
    i32.load offset=84
    local.get 3
    call 44285
    local.get 0
    i32.load offset=72
    local.set 2
    local.get 0
    i32.load offset=16
    i32.const 0
    call 48736
    local.get 2
    i32.const 1
    i32.ne
    i32.const 0
    call 48833
    local.get 0
    i32.load offset=20
    i32.const 0
    call 48736
    local.get 2
    i32.const 1
    i32.eq
    local.tee 2
    i32.const 0
    call 48833
    local.get 0
    i32.load offset=24
    i32.const 0
    call 48736
    local.get 2
    i32.const 0
    call 48833
    block  ;; label = @1
      local.get 1
      local.get 6
      i32.eq
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=48
      local.tee 2
      i32.eqz
      br_if 0 (;@1;)
      local.get 2
      local.get 6
      local.get 1
      i32.const 0
      call 41000
    end
    local.get 3
    i32.const 16
    i32.add
    global.set 0)
